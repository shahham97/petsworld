import React from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FolderTree } from "lucide-react";
import type { Metadata } from "next";

import { getCachedCategoriesHub, getCachedPageSeo } from "@/lib/cached-data";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const pageSeo = await getCachedPageSeo("categories");
  return {
    title: pageSeo?.seoTitle || "Pet Product Categories | Cat, Dog & Bird Supplies | PetsWorld",
    description: pageSeo?.seoDescription || "Explore cat food, dog food, accessories and bird products. Find the right supplies for your pet at PetsWorld.pk.",
    alternates: { canonical: "https://petsworld.pk/categories" },
  };
}

export default async function CategoriesHubPage() {
  const categories = await getCachedCategoriesHub();

  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Breadcrumbs items={[{ label: "Categories" }]} />

        <div className="text-center max-w-2xl mx-auto py-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight">
            Browse Pet Product Categories
          </h1>
          <p className="mt-3 text-sm text-[#6B6560] leading-relaxed">
            Find the right food, nutritional formulas, leashes, and aviary supplies tailored specifically to your companion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-16">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm flex flex-col justify-between space-y-6 hover:border-[#1F4D3A] transition-colors"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="relative w-16 h-16 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] overflow-hidden shrink-0 flex items-center justify-center font-black text-2xl text-[#1F4D3A]"
                    style={{ position: "relative" }}
                  >
                    {cat.imageAssetId ? (
                      <Image
                        src={`/media/${cat.imageAssetId}/thumb`}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      cat.name.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#2B2622]">
                      <Link href={`/category/${cat.slug}`} className="hover:text-[#1F4D3A]">
                        {cat.name}
                      </Link>
                    </h2>
                    <p className="text-xs text-[#6B6560] mt-1">{cat.description}</p>
                  </div>
                </div>

                {/* Subcategories list */}
                {cat.children.length > 0 && (
                  <div className="pt-4 border-t border-[#E8D9CD]/70 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[#D98E3F] block">
                      Subcategories
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${sub.slug}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF8F0] hover:bg-[#F4DFCB]/60 text-xs font-semibold text-[#2B2622] transition-colors"
                        >
                          <span>{sub.name}</span>
                          <span className="text-[10px] text-[#6B6560] font-mono">
                            {sub._count.products} items
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={`/category/${cat.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] hover:underline pt-2"
              >
                <span>View all in {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
