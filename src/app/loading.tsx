import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center py-20 px-4 bg-[#FFF8F0]">
      <div className="relative flex flex-col items-center space-y-4">
        {/* Animated Paw Pulse */}
        <div className="relative w-16 h-16 rounded-full bg-[#1F4D3A]/10 flex items-center justify-center animate-pulse">
          <span className="text-3xl select-none" role="img" aria-label="loading">🐾</span>
          <div className="absolute inset-0 rounded-full border-2 border-[#1F4D3A]/30 animate-ping opacity-30" />
        </div>
        <div className="space-y-1.5 text-center">
          <p className="text-sm font-bold text-[#2B2622] font-display tracking-tight">
            Fetching Pet Delights...
          </p>
          <p className="text-xs text-[#6B6560]">
            Bringing you fresh stock & verified prices
          </p>
        </div>
      </div>
    </div>
  );
}
