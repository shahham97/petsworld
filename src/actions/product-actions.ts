"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { invalidateProductsCache } from "@/lib/cache";
import { sanitizeRichText } from "@/lib/sanitize";
import { handleServerError } from "@/lib/messages";
import { revalidatePath } from "next/cache";

const ProductInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters."),
  slug: z.string().trim().min(2, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  sku: z.string().trim().min(2, "SKU is required."),
  brand: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().min(10, "Please provide a detailed product description."),
  price: z.coerce.number().positive("Price must be greater than zero."),
  salePrice: z.coerce.number().positive().nullable().optional(),
  stockQty: z.coerce.number().int().min(0, "Stock quantity cannot be negative."),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  featuredSort: z.coerce.number().int().default(0),
  weight: z.string().trim().optional(),
  dimensions: z.string().trim().optional(),
  ingredients: z.string().trim().optional(),
  usageInstructions: z.string().trim().optional(),
  hasAllergyNotice: z.boolean().default(false),
  allergyNoticeText: z.string().trim().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  canonicalUrl: z.string().trim().optional(),
  ogAssetId: z.string().nullable().optional(),
  categoryIds: z.array(z.string()).min(1, "Select at least one category."),
  primaryCategoryId: z.string().optional(),
  specs: z.array(z.object({
    key: z.string().trim(),
    value: z.string().trim(),
  })).default([]),
  images: z.array(z.object({
    assetId: z.string(),
    altText: z.string().optional(),
    sortOrder: z.number().default(0),
  })).default([]),
  faqs: z.array(z.object({
    id: z.string().optional(),
    question: z.string().trim(),
    answer: z.string().trim(),
  })).default([]),
});

export type ProductActionState = {
  success: boolean;
  productId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function saveProductAction(rawData: unknown): Promise<ProductActionState> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const validated = ProductInputSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      fieldErrors: validated.error.flatten().fieldErrors,
      error: "Please correct the errors in the form.",
    };
  }

  const data = validated.data;

  // Validate sale price
  if (data.salePrice && data.salePrice >= data.price) {
    return {
      success: false,
      fieldErrors: { salePrice: ["Sale price must be strictly lower than regular price."] },
      error: "Sale price must be lower than original price.",
    };
  }

  // Validate allergy text if notice is enabled
  if (data.hasAllergyNotice && (!data.allergyNoticeText || data.allergyNoticeText.trim().length === 0)) {
    return {
      success: false,
      fieldErrors: { allergyNoticeText: ["Allergy notice text is required when allergy toggle is active."] },
      error: "Please enter allergy notice text.",
    };
  }

  try {
    // Check slug and SKU uniqueness
    const [existingSlug, existingSku] = await Promise.all([
      db.product.findUnique({ where: { slug: data.slug } }),
      db.product.findUnique({ where: { sku: data.sku } }),
    ]);

    if (existingSlug && existingSlug.id !== data.id) {
      return {
        success: false,
        fieldErrors: { slug: ["This slug is already used by another product."] },
        error: "URL slug must be unique.",
      };
    }

    if (existingSku && existingSku.id !== data.id) {
      return {
        success: false,
        fieldErrors: { sku: ["This SKU is already assigned to another product."] },
        error: "SKU must be unique.",
      };
    }

    const sanitizedDescription = sanitizeRichText(data.description);
    const sanitizedIngredients = data.ingredients ? sanitizeRichText(data.ingredients) : null;
    const sanitizedUsage = data.usageInstructions ? sanitizeRichText(data.usageInstructions) : null;

    const savedProduct = await db.$transaction(async (tx) => {
      let product;
      const productPayload = {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        brand: data.brand || null,
        shortDescription: data.shortDescription || null,
        description: sanitizedDescription,
        price: data.price,
        salePrice: data.salePrice || null,
        stockQty: data.stockQty,
        lowStockThreshold: data.lowStockThreshold,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        featuredSort: data.featuredSort,
        weight: data.weight || null,
        dimensions: data.dimensions || null,
        ingredients: sanitizedIngredients,
        usageInstructions: sanitizedUsage,
        hasAllergyNotice: data.hasAllergyNotice,
        allergyNoticeText: data.hasAllergyNotice ? data.allergyNoticeText : null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        canonicalUrl: data.canonicalUrl || null,
        ogAssetId: data.images[0]?.assetId || null,
      };

      if (data.id) {
        product = await tx.product.update({
          where: { id: data.id },
          data: productPayload,
        });

        // Clean existing relations to replace
        await tx.productCategory.deleteMany({ where: { productId: product.id } });
        await tx.productImage.deleteMany({ where: { productId: product.id } });
        await tx.productSpec.deleteMany({ where: { productId: product.id } });
        await tx.faq.deleteMany({ where: { scopeType: "PRODUCT", scopeKey: product.id } });
      } else {
        product = await tx.product.create({
          data: productPayload,
        });
      }

      // 1. Insert Categories
      const primaryCatId = data.primaryCategoryId || data.categoryIds[0];
      for (const catId of data.categoryIds) {
        await tx.productCategory.create({
          data: {
            productId: product.id,
            categoryId: catId,
            isPrimary: catId === primaryCatId,
          },
        });
      }

      // 2. Insert Images
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        await tx.productImage.create({
          data: {
            productId: product.id,
            assetId: img.assetId,
            altText: img.altText || data.name,
            sortOrder: i,
          },
        });
      }

      // 3. Insert Specs
      for (let i = 0; i < data.specs.length; i++) {
        const spec = data.specs[i];
        if (spec.key.trim() && spec.value.trim()) {
          await tx.productSpec.create({
            data: {
              productId: product.id,
              key: spec.key.trim(),
              value: spec.value.trim(),
              sortOrder: i,
            },
          });
        }
      }

      // 4. Insert Scoped FAQs
      for (let i = 0; i < data.faqs.length; i++) {
        const f = data.faqs[i];
        if (f.question.trim() && f.answer.trim()) {
          await tx.faq.create({
            data: {
              question: f.question.trim(),
              answer: f.answer.trim(),
              scopeType: "PRODUCT",
              scopeKey: product.id,
              sortOrder: i,
              isActive: true,
            },
          });
        }
      }

      return product;
    });

    invalidateProductsCache(savedProduct.slug);
    revalidatePath("/admin/products");
    return { success: true, productId: savedProduct.id };
  } catch (error) {
    const safeError = handleServerError(error, "SAVE_PRODUCT");
    return { success: false, error: safeError.error };
  }
}

export async function toggleProductPublishedAction(id: string, isPublished: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const prod = await db.product.update({
      where: { id },
      data: { isPublished },
      select: { slug: true },
    });
    invalidateProductsCache(prod.slug);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "TOGGLE_PRODUCT_PUBLISHED");
    return { success: false, error: safe.error };
  }
}

export async function toggleProductFeaturedAction(id: string, isFeatured: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const prod = await db.product.update({
      where: { id },
      data: { isFeatured },
      select: { slug: true },
    });
    invalidateProductsCache(prod.slug);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "TOGGLE_PRODUCT_FEATURED");
    return { success: false, error: safe.error };
  }
}

export async function softDeleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const prod = await db.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { slug: true },
    });
    invalidateProductsCache(prod.slug);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SOFT_DELETE_PRODUCT");
    return { success: false, error: safe.error };
  }
}
