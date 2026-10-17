"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleChange(e.target.value)}
      className="px-4 py-2.5 rounded-full border border-[#E8D9CD] bg-white text-base sm:text-xs font-semibold text-[#2B2622] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A] cursor-pointer"
    >
      <option value="newest">Sort: Newest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="name">Alphabetical</option>
    </select>
  );
}
