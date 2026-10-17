import React from "react";
import { db } from "@/lib/db";
import { SeoFormCard } from "./SeoFormCard";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const pagesSeo = await db.pageSeo.findMany({
    orderBy: { pageKey: "asc" },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight flex items-center gap-2">
          <Search className="w-7 h-7 text-[#1F4D3A]" />
          <span>Page SEO & Metadata Management</span>
        </h1>
        <p className="text-xs text-[#6B6560] mt-1">
          Customize titles, meta descriptions, and Google SERP snippets for static store pages in real-time without redeployment
        </p>
      </div>

      <div className="space-y-6">
        {pagesSeo.map((page) => (
          <SeoFormCard key={page.pageKey} pageSeo={page} />
        ))}
      </div>
    </div>
  );
}
