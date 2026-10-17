import React from "react";

export default function ProductLoading() {
  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-[#E8D9CD]/60 rounded-full" />

        {/* Product Details Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square w-full bg-white rounded-3xl border border-[#E8D9CD] shadow-sm" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 bg-white rounded-2xl border border-[#E8D9CD]" />
              ))}
            </div>
          </div>

          {/* Details Skeleton */}
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-[#E8D9CD]/60 rounded-full" />
              <div className="h-8 w-3/4 bg-[#E8D9CD]/80 rounded-2xl" />
              <div className="h-4 w-32 bg-[#E8D9CD]/40 rounded-full" />
            </div>

            <div className="h-10 w-36 bg-[#E8D9CD]/70 rounded-2xl" />

            <div className="space-y-2 pt-2 border-t border-[#E8D9CD]">
              <div className="h-4 w-full bg-[#E8D9CD]/40 rounded-full" />
              <div className="h-4 w-5/6 bg-[#E8D9CD]/40 rounded-full" />
            </div>

            <div className="flex gap-4 pt-4">
              <div className="h-12 w-32 bg-[#E8D9CD]/60 rounded-full" />
              <div className="h-12 flex-1 bg-[#1F4D3A]/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
