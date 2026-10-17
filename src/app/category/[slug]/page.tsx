import React from "react";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({
    where: { slug },
    select: { name: true, seoTitle: true, seoDescription: true, description: true },
  });

  if (!category) return {};

  const fallbackTitle = `${category.name} in Pakistan | Buy Online | PetsWorld`;
  const fallbackDesc =
    category.description ||
    `Shop ${category.name} online in Pakistan at PetsWorld. Fast delivery, Cash on Delivery, and 100% genuine pet supplies.`;

  return {
    title: category.seoTitle || fallbackTitle,
    description: category.seoDescription || fallbackDesc,
    alternates: {
      canonical: `https://petsworld.pk/category/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { where: { isActive: true }, select: { id: true, name: true, slug: true } },
      products: {
        where: {
          product: { isPublished: true, deletedAt: null },
        },
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  // Scoped FAQs (Category-scoped falling back to Global)
  let faqs = await db.faq.findMany({
    where: {
      isActive: true,
      scopeType: "CATEGORY",
      scopeKey: category.id,
    },
    orderBy: { sortOrder: "asc" },
  });

  if (faqs.length === 0) {
    faqs = await db.faq.findMany({
      where: { isActive: true, scopeType: "GLOBAL" },
      orderBy: { sortOrder: "asc" },
      take: 4,
    });
  }

  const settings = await db.storeSettings.findUnique({ where: { id: "default" } });

  const breadcrumbItems = [];
  if (category.parent) {
    breadcrumbItems.push({
      label: category.parent.name,
      href: `/category/${category.parent.slug}`,
    });
  }
  breadcrumbItems.push({ label: category.name });

  const productCards: ProductCardData[] = category.products.map(({ product: p }) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    stockQty: p.stockQty,
    lowStockThreshold: p.lowStockThreshold,
    imageAssetId: p.images[0]?.assetId || null,
  }));

  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Category Header */}
        <div className="py-6 border-b border-[#E8D9CD]/70 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight">
            {category.name} in Pakistan
          </h1>
          {category.description && (
            <p className="text-sm sm:text-base text-[#6B6560] max-w-3xl leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Subcategories pills */}
          {category.children.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-[#6B6560]">Subcategories:</span>
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/category/${child.slug}`}
                  className="px-3 py-1 rounded-full bg-white border border-[#E8D9CD] text-xs font-semibold text-[#1F4D3A] hover:bg-[#F4DFCB]/60 transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="py-8 sm:py-10">
          {productCards.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 text-center rounded-3xl border border-[#E8D9CD] shadow-sm">
              <p className="text-sm text-[#6B6560]">
                No active products currently in this category. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {productCards.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* Scoped FAQs */}
        {faqs.length > 0 && (
          <FaqAccordion
            faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            title={`${category.name} FAQs`}
          />
        )}
      </main>
    </div>
  );
}
