import React from "react";

export default function CategoryLoading() {
  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
        <div className="h-4 w-40 bg-[#E8D9CD]/60 rounded-full" />
        <div className="space-y-2">
          <div className="h-9 w-60 bg-[#E8D9CD]/80 rounded-2xl" />
          <div className="h-4 w-96 bg-[#E8D9CD]/50 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
  );
}
