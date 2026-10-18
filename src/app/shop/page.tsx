import React from "react";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { db } from "@/lib/db";
import Link from "next/link";
import { Search, SlidersHorizontal, PackageX } from "lucide-react";
import type { Metadata } from "next";

import { getCachedPageSeo } from "@/lib/cached-data";
import { SortSelect } from "@/components/shop/SortSelect";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}): Promise<Metadata> {
  const { q, category, sort, page } = await searchParams;
  const hasFilters = Boolean(q || category || sort || (page && page !== "1"));

  const pageSeo = await getCachedPageSeo("shop");

  return {
    title: pageSeo?.seoTitle || "Shop Pet Supplies Online in Pakistan | PetsWorld",
    description: pageSeo?.seoDescription || "Browse all cat, dog and bird products. Order online with COD, Easypaisa or JazzCash.",
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: {
      canonical: "https://petsworld.pk/shop",
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    in_stock?: string;
    brand?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const categorySlug = params.category || "";
  const sort = params.sort || "newest";
  const inStockOnly = params.in_stock === "true";
  const brand = params.brand || "";
  const page = parseInt(params.page || "1") || 1;
  const pageSize = 12;

  // Build Prisma where clause
  const where: any = {
    isPublished: true,
    deletedAt: null,
  };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
      { shortDescription: { contains: q } },
    ];
  }

  if (categorySlug) {
    const parentCategory = await db.category.findUnique({
      where: { slug: categorySlug },
      select: {
        id: true,
        children: { where: { isActive: true }, select: { slug: true } },
      },
    });

    const matchingSlugs = parentCategory
      ? [categorySlug, ...parentCategory.children.map((c) => c.slug)]
      : [categorySlug];

    where.categories = {
      some: {
        category: { slug: { in: matchingSlugs } },
      },
    };
  }

  if (brand) {
    where.brand = brand;
  }

  if (inStockOnly) {
    where.stockQty = { gt: 0 };
  }

  // Sorting
  let orderBy: any = [{ createdAt: "desc" }];
  if (sort === "price-low") orderBy = [{ price: "asc" }];
  else if (sort === "price-high") orderBy = [{ price: "desc" }];
  else if (sort === "name") orderBy = [{ name: "asc" }];

  const [products, totalCount, categories, settings, brandsRaw] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.storeSettings.findUnique({ where: { id: "default" } }),
    db.product.findMany({
      where: { isPublished: true, deletedAt: null, brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
    }),
  ]);

  const brands = brandsRaw.map((b) => b.brand).filter(Boolean) as string[];
  const totalPages = Math.ceil(totalCount / pageSize);

  const productCards: ProductCardData[] = products.map((p) => ({
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
        <Breadcrumbs items={[{ label: "Shop All Products" }]} />

        {/* Title & Search / Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E8D9CD]/70 pt-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight">
              Shop Pet Supplies
            </h1>
            <p className="text-sm text-[#6B6560] mt-1">
              Showing {products.length} of {totalCount} authentic pet products
            </p>
          </div>

          {/* Quick Search & Sort Form */}
          <div className="flex flex-wrap items-center gap-3">
            <form method="GET" action="/shop" className="relative flex-1 sm:w-64">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search food, treats..."
                className="w-full pl-9 pr-4 py-2.5 rounded-full border border-[#E8D9CD] bg-white text-base sm:text-xs text-[#2B2622] placeholder:text-[#6B6560]/60 focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
              />
              <Search className="w-4 h-4 text-[#6B6560] absolute left-3 top-3 pointer-events-none" />
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            </form>

            <div className="shrink-0">
              <SortSelect currentSort={sort} />
            </div>
          </div>
        </div>

        {/* Quick Category Filter Pills (Mobile & Tablet) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2 pt-4 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link
            href={`/shop?sort=${sort}${q ? `&q=${q}` : ""}`}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              !categorySlug
                ? "bg-[#1F4D3A] text-white shadow-xs"
                : "bg-white text-[#2B2622] border border-[#E8D9CD] hover:border-[#1F4D3A]"
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}&sort=${sort}${q ? `&q=${q}` : ""}`}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                categorySlug === c.slug
                  ? "bg-[#1F4D3A] text-white shadow-xs"
                  : "bg-white text-[#2B2622] border border-[#E8D9CD] hover:border-[#1F4D3A]"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Content Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4 lg:pt-8">
          {/* Sidebar Filters (Desktop Only) */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8D9CD]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#2B2622] flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F4D3A]" />
                  <span>Filter Supplies</span>
                </h2>
                {(categorySlug || q || inStockOnly || brand) && (
                  <Link href="/shop" className="text-[11px] font-bold text-[#991B1B] hover:underline">
                    Reset
                  </Link>
                )}
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase text-[#D98E3F] mb-3">Category</h3>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <Link
                      href={`/shop?sort=${sort}${q ? `&q=${q}` : ""}`}
                      className={`block py-1 px-2.5 rounded-lg transition-colors ${
                        !categorySlug ? "bg-[#1F4D3A] text-white font-bold" : "text-[#2B2622] hover:bg-[#FFF8F0]"
                      }`}
                    >
                      All Categories
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/shop?category=${c.slug}&sort=${sort}${q ? `&q=${q}` : ""}`}
                        className={`block py-1 px-2.5 rounded-lg transition-colors ${
                          categorySlug === c.slug
                            ? "bg-[#1F4D3A] text-white font-bold"
                            : "text-[#2B2622] hover:bg-[#FFF8F0]"
                        }`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brands Filter */}
              {brands.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#D98E3F] mb-3">Brand</h3>
                  <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
                    {brands.map((b) => (
                      <Link
                        key={b}
                        href={`/shop?brand=${encodeURIComponent(b)}&sort=${sort}${categorySlug ? `&category=${categorySlug}` : ""}`}
                        className={`block py-1 px-2.5 rounded-lg transition-colors ${
                          brand === b ? "bg-[#1F4D3A] text-white font-bold" : "text-[#2B2622] hover:bg-[#FFF8F0]"
                        }`}
                      >
                        {b}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Filter */}
              <div className="pt-2 border-t border-[#E8D9CD]">
                <Link
                  href={`/shop?in_stock=${!inStockOnly}&sort=${sort}${categorySlug ? `&category=${categorySlug}` : ""}`}
                  className="flex items-center gap-2.5 text-xs font-semibold text-[#2B2622] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={inStockOnly}
                    className="w-4 h-4 rounded text-[#1F4D3A]"
                  />
                  <span>In Stock Items Only</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {productCards.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-[#E8D9CD] shadow-sm flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF8F0] flex items-center justify-center text-[#6B6560]">
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#2B2622]">No Products Found</h3>
                <p className="text-xs text-[#6B6560] max-w-sm">
                  We couldn&apos;t find any pet products matching your selected criteria. Try adjusting your search keywords or removing filters.
                </p>
                <Link
                  href="/shop"
                  className="px-6 py-2.5 rounded-full bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C]"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                  {productCards.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pNum = i + 1;
                      const isActive = pNum === page;
                      return (
                        <Link
                          key={pNum}
                          href={`/shop?page=${pNum}&sort=${sort}${categorySlug ? `&category=${categorySlug}` : ""}${q ? `&q=${q}` : ""}`}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                            isActive
                              ? "bg-[#1F4D3A] text-white shadow-md shadow-[#1F4D3A]/20"
                              : "bg-white border border-[#E8D9CD] text-[#2B2622] hover:bg-[#FFF8F0]"
                          }`}
                        >
                          {pNum}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
