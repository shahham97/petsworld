import React from "react";
import { db } from "@/lib/db";
import { ProductEditor, ProductFormData } from "@/components/admin/ProductEditor";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        categories: true,
        images: { orderBy: { sortOrder: "asc" } },
        specs: { orderBy: { sortOrder: "asc" } },
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        parentId: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, parentId: true },
        },
      },
    }),
  ]);

  if (!product || product.deletedAt) {
    notFound();
  }

  // Fetch product's scoped FAQs
  const faqs = await db.faq.findMany({
    where: { scopeType: "PRODUCT", scopeKey: product.id },
    orderBy: { sortOrder: "asc" },
  });

  const formattedProduct: ProductFormData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand || "",
    shortDescription: product.shortDescription || "",
    description: product.description,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    stockQty: product.stockQty,
    lowStockThreshold: product.lowStockThreshold,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    featuredSort: product.featuredSort,
    weight: product.weight || "",
    dimensions: product.dimensions || "",
    ingredients: product.ingredients || "",
    usageInstructions: product.usageInstructions || "",
    hasAllergyNotice: product.hasAllergyNotice,
    allergyNoticeText: product.allergyNoticeText || "",
    seoTitle: product.seoTitle || "",
    seoDescription: product.seoDescription || "",
    canonicalUrl: product.canonicalUrl || "",
    categoryIds: product.categories.map((c) => c.categoryId),
    primaryCategoryId:
      product.categories.find((c) => c.isPrimary)?.categoryId ||
      product.categories[0]?.categoryId ||
      "",
    specs: product.specs.map((s) => ({ key: s.key, value: s.value })),
    images: product.images.map((img) => ({
      assetId: img.assetId,
      altText: img.altText || "",
      sortOrder: img.sortOrder,
    })),
    faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
  };

  return <ProductEditor initialData={formattedProduct} categories={categories} />;
}
