import React from "react";

export default function ShopLoading() {
  return (
    <div className="bg-[#FFF8F0] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-32 bg-[#E8D9CD]/60 rounded-full" />

        {/* Header bar skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E8D9CD]">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-[#E8D9CD]/80 rounded-2xl" />
            <div className="h-4 w-64 bg-[#E8D9CD]/50 rounded-full" />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="h-10 w-full sm:w-48 bg-[#E8D9CD]/60 rounded-full" />
            <div className="h-10 w-32 bg-[#E8D9CD]/60 rounded-full" />
          </div>
        </div>

        {/* Content Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="h-64 bg-white rounded-3xl border border-[#E8D9CD]/50 p-6 space-y-4">
              <div className="h-5 w-24 bg-[#E8D9CD]/70 rounded-full" />
              <div className="space-y-2.5 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 w-full bg-[#E8D9CD]/40 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid Skeleton */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-[#E8D9CD]/60 p-5 space-y-4 shadow-xs"
              >
                <div className="aspect-square w-full bg-[#FFF8F0] rounded-2xl" />
                <div className="h-3 w-20 bg-[#E8D9CD]/50 rounded-full" />
                <div className="h-5 w-3/4 bg-[#E8D9CD]/80 rounded-xl" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-24 bg-[#E8D9CD]/70 rounded-full" />
                  <div className="h-9 w-20 bg-[#1F4D3A]/20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
