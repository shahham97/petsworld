import React from "react";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { BlogTable } from "./BlogTable";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      authorName: true,
      status: true,
      publishedAt: true,
      readingTimeMin: true,
      tags: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-[#1F4D3A]" />
            <span>Blog & Pet Care Guides</span>
          </h1>
          <p className="text-xs text-[#6B6560] mt-1">
            Publish educational articles, nutrition comparisons, and grooming tips with auto-generated TOC and schema.
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      <BlogTable initialPosts={posts} />
    </div>
  );
}
