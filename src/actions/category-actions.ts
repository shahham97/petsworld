"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { invalidateCategoriesCache } from "@/lib/cache";
import { handleServerError } from "@/lib/messages";
import { revalidatePath } from "next/cache";

const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  slug: z.string().trim().min(2, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  parentId: z.string().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  imageAssetId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().trim().nullable().optional(),
  seoDescription: z.string().trim().nullable().optional(),
});

export type CategoryActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function saveCategoryAction(data: z.infer<typeof CategorySchema>): Promise<CategoryActionState> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = CategorySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      fieldErrors: validated.error.flatten().fieldErrors,
      error: "Please correct the errors in the form.",
    };
  }

  const { id, name, slug, parentId, description, imageAssetId, sortOrder, isActive, seoTitle, seoDescription } = validated.data;

  try {
    // Check slug uniqueness
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return {
        success: false,
        fieldErrors: { slug: ["This slug is already used by another category."] },
        error: "This URL slug cannot be used.",
      };
    }

    if (id) {
      await db.category.update({
        where: { id },
        data: {
          name,
          slug,
          parentId: parentId || null,
          description: description || null,
          imageAssetId: imageAssetId || null,
          sortOrder,
          isActive,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
        },
      });
    } else {
      await db.category.create({
        data: {
          name,
          slug,
          parentId: parentId || null,
          description: description || null,
          imageAssetId: imageAssetId || null,
          sortOrder,
          isActive,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
        },
      });
    }

    invalidateCategoriesCache(slug);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    const safeError = handleServerError(error, "SAVE_CATEGORY");
    return { success: false, error: safeError.error };
  }
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const cat = await db.category.update({
      where: { id },
      data: { isActive },
      select: { slug: true },
    });
    invalidateCategoriesCache(cat.slug);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "TOGGLE_CATEGORY");
    return { success: false, error: safe.error };
  }
}

export async function deleteCategoryAction(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const childCount = await db.category.count({ where: { parentId: id } });
    if (childCount > 0) {
      return { success: false, error: "Cannot delete a category that contains subcategories." };
    }

    const cat = await db.category.delete({
      where: { id },
      select: { slug: true },
    });
    invalidateCategoriesCache(cat.slug);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "DELETE_CATEGORY");
    return { success: false, error: safe.error };
  }
}
