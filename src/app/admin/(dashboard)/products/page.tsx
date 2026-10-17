import React from "react";
import { db } from "@/lib/db";
import { ProductsTable, AdminProductItem } from "./ProductsTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; filter?: string }>;
}) {
  const { q, category, filter } = await searchParams;

  const whereClause: Record<string, unknown> = {
    deletedAt: null,
  };

  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { brand: { contains: q } },
    ];
  }

  if (category) {
    whereClause.categories = {
      some: { categoryId: category },
    };
  }

  if (filter === "low_stock") {
    whereClause.stockQty = { lte: 5 };
  } else if (filter === "featured") {
    whereClause.isFeatured = true;
  }

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where: whereClause,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        salePrice: true,
        stockQty: true,
        lowStockThreshold: true,
        isPublished: true,
        isFeatured: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { assetId: true, altText: true },
        },
        categories: {
          select: { category: { select: { name: true } } },
        },
      },
    }),
    db.product.count({ where: { deletedAt: null } }),
  ]);

  const formatted: AdminProductItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    price: p.price.toString(),
    salePrice: p.salePrice ? p.salePrice.toString() : null,
    stockQty: p.stockQty,
    lowStockThreshold: p.lowStockThreshold,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    images: p.images,
    categories: p.categories,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            Products Catalog ({totalCount})
          </h1>
          <p className="text-sm text-[#6B6560] mt-1">
            Manage product pricing, inventory levels, specifications, and featured highlights
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      <ProductsTable products={formatted} />
    </div>
  );
}
