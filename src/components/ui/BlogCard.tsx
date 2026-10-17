import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight } from "lucide-react";

export interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverAssetId?: string | null;
    coverAlt?: string | null;
    authorName: string;
    publishedAt?: Date | string | null;
    readingTimeMin: number;
    tags?: string | null;
  };
}

export function BlogCard({ post }: BlogCardProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  const firstTag = post.tags ? post.tags.split(",")[0]?.trim() : null;

  return (
    <article className="group flex flex-col bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-xs hover:shadow-md hover:border-[#D98E3F]/40 transition-all duration-300">
      <Link
        href={`/blog/${post.slug}`}
        className="relative aspect-[16/10] bg-[#FFF8F0] overflow-hidden"
        style={{ position: "relative" }}
      >
        {post.coverAssetId ? (
          <Image
            src={`/media/${post.coverAssetId}/md`}
            alt={post.coverAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#F4DFCB]/60">
            <span className="text-3xl font-serif text-[#1F4D3A]/30">PW</span>
          </div>
        )}

        {firstTag && (
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#1F4D3A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
            {firstTag}
          </span>
        )}
      </Link>

      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-xs text-[#6B6560] mb-3">
          <span className="inline-flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#D98E3F]" />
            {publishedDate}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#D98E3F]" />
            {post.readingTimeMin} min read
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#2B2622] group-hover:text-[#1F4D3A] transition-colors leading-snug line-clamp-2 mb-2 font-display">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="text-sm text-[#6B6560] line-clamp-3 mb-4 leading-relaxed flex-1">
          {post.excerpt}
        </p>

        <div className="pt-4 border-t border-[#F4DFCB]/60 flex items-center justify-between text-xs font-bold text-[#1F4D3A]">
          <span className="text-[#6B6560] font-normal">By {post.authorName}</span>
          <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Read Guide <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
