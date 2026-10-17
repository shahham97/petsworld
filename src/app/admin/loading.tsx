import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-[#E8D9CD]">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#E8D9CD]/80 rounded-2xl" />
          <div className="h-4 w-72 bg-[#E8D9CD]/50 rounded-full" />
        </div>
        <div className="h-10 w-28 bg-[#1F4D3A]/20 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-[#E8D9CD] space-y-3">
            <div className="h-4 w-20 bg-[#E8D9CD]/50 rounded-full" />
            <div className="h-8 w-24 bg-[#E8D9CD]/80 rounded-2xl" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-4">
        <div className="h-6 w-36 bg-[#E8D9CD]/70 rounded-xl" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-[#E8D9CD]/30 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
