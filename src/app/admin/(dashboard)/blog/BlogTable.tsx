"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, ExternalLink, Search, Clock, FileText, Loader2 } from "lucide-react";
import { deleteBlogPostAction } from "@/actions/blog-actions";
import { useToast } from "@/components/ui/Toast";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  authorName: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | string | null;
  readingTimeMin: number;
  tags: string | null;
  updatedAt: Date | string;
}

export function BlogTable({ initialPosts }: { initialPosts: PostItem[] }) {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteBlogPostAction(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Post deleted successfully.");
      } else {
        toast.error(res.error || "Failed to delete post.");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, tag, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622] placeholder:text-[#6B6560]/60 focus:outline-none focus:border-[#1F4D3A]"
          />
        </div>

        <div className="text-xs text-[#6B6560] self-end sm:self-auto font-medium">
          Showing <span className="font-bold text-[#2B2622]">{filtered.length}</span> of{" "}
          <span className="font-bold text-[#2B2622]">{posts.length}</span> posts
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8D9CD] bg-[#FFF8F0]/50 text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Read Time</th>
                <th className="py-3.5 px-4">Published</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D9CD] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B6560]">
                    <FileText className="w-8 h-8 text-[#6B6560]/40 mx-auto mb-2" />
                    No blog posts found. Click &quot;New Article&quot; to publish pet care guides.
                  </td>
                </tr>
              ) : (
                filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FFF8F0]/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#2B2622] max-w-xs">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="hover:text-[#1F4D3A] transition-colors line-clamp-1 block"
                      >
                        {post.title}
                      </Link>
                      <span className="text-[11px] font-mono text-[#6B6560] font-normal">
                        /blog/{post.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          post.status === "PUBLISHED"
                            ? "bg-[#1F4D3A]/10 text-[#1F4D3A]"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6B6560]">{post.authorName}</td>
                    <td className="py-3 px-4 text-[#6B6560] inline-flex items-center gap-1 mt-3">
                      <Clock className="w-3 h-3 text-[#D98E3F]" />
                      <span>{post.readingTimeMin}m</span>
                    </td>
                    <td className="py-3 px-4 text-[#6B6560]">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-PK", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Draft"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "PUBLISHED" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            title="View Public Article"
                            className="p-1.5 rounded-xl border border-[#E8D9CD] hover:bg-[#FFF8F0] text-[#6B6560] hover:text-[#1F4D3A]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}`}
                          title="Edit Article"
                          className="p-1.5 rounded-xl border border-[#E8D9CD] hover:bg-[#FFF8F0] text-[#6B6560] hover:text-[#1F4D3A]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          disabled={isPending && deletingId === post.id}
                          onClick={() => handleDelete(post.id, post.title)}
                          title="Delete Article"
                          className="p-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-50 cursor-pointer"
                        >
                          {isPending && deletingId === post.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
