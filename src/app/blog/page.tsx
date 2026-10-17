import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { BlogCard } from "@/components/ui/BlogCard";
import { BookOpen, Filter } from "lucide-react";

export const revalidate = 120;

interface BlogIndexProps {
  searchParams: Promise<{ tag?: string }>;
}

import { getCachedPageSeo } from "@/lib/cached-data";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCachedPageSeo("blog");

  return {
    title: seo?.seoTitle || "Pet Care Blog & Nutrition Guides | PetsWorld.pk",
    description:
      seo?.seoDescription ||
      "Expert advice, vet tips, nutrition guides, and pet care resources tailored for pet parents across Pakistan.",
    alternates: {
      canonical: `${process.env.SITE_URL || "https://petsworld.pk"}/blog`,
    },
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const { tag } = await searchParams;

  const [posts, seo] = await Promise.all([
    db.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(tag
          ? {
              tags: {
                contains: tag,
              },
            }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverAssetId: true,
        coverAlt: true,
        authorName: true,
        publishedAt: true,
        readingTimeMin: true,
        tags: true,
      },
    }),
    db.pageSeo.findUnique({ where: { pageKey: "blog" } }),
  ]);

  // Extract all unique tags
  const allPosts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { tags: true },
  });

  const tagSet = new Set<string>();
  allPosts.forEach((p) => {
    if (p.tags) {
      p.tags.split(",").forEach((t) => {
        const cleaned = t.trim();
        if (cleaned) tagSet.add(cleaned);
      });
    }
  });
  const allTags = Array.from(tagSet);

  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] text-xs font-bold tracking-wide">
            <BookOpen className="w-3.5 h-3.5" />
            <span>PetsWorld Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2622] tracking-tight font-display">
            Pet Care & Nutrition Guides
          </h1>

          <p className="text-sm sm:text-base text-[#6B6560] leading-relaxed">
            {seo?.editableIntroText ||
              "Practical, science-backed guidance on diet, grooming, hydration, and wellness for cats, dogs, and birds in Pakistan."}
          </p>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                !tag
                  ? "bg-[#1F4D3A] text-white shadow-xs"
                  : "bg-white text-[#6B6560] border border-[#E8D9CD] hover:bg-[#FFF8F0]"
              }`}
            >
              All Guides
            </Link>
            {allTags.map((t) => {
              const isActive = tag === t;
              return (
                <Link
                  key={t}
                  href={`/blog?tag=${encodeURIComponent(t)}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#1F4D3A] text-white shadow-xs"
                      : "bg-white text-[#6B6560] border border-[#E8D9CD] hover:bg-[#FFF8F0]"
                  }`}
                >
                  {t}
                </Link>
              );
            })}
          </div>
        )}

        {/* Post Grid or Polished Empty State */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-12 text-center max-w-lg mx-auto space-y-3">
            <BookOpen className="w-12 h-12 text-[#1F4D3A]/30 mx-auto" />
            <h3 className="text-lg font-bold text-[#2B2622]">No Articles Found</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              {tag
                ? `There are currently no articles tagged with "${tag}". Try selecting another category.`
                : "Our editorial team is crafting comprehensive pet care articles. Please check back soon!"}
            </p>
            {tag && (
              <Link
                href="/blog"
                className="inline-block px-5 py-2 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold mt-2"
              >
                View All Articles
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
