"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";

export interface FeaturedSliderProps {
  products: ProductCardData[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function FeaturedSlider({
  products,
  title = "Featured Pet Favorites",
  subtitle = "Top-rated pet food, nutritional formulas, and accessories hand-picked for quality",
  badge = "Curated Recommendations",
}: FeaturedSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FFF8F0] border-b border-[#E8D9CD]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Arrows */}
        <div className="flex items-end justify-between mb-8">
          <div>
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBC9AA]/50 text-xs font-bold text-[#1F4D3A] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D98E3F]" aria-hidden="true" />
                <span>{badge}</span>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight font-display">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 rounded-full bg-white border border-[#E8D9CD] hover:border-[#1F4D3A] hover:bg-[#FFF8F0] text-[#1F4D3A] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
              aria-label="Previous featured products"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 rounded-full bg-white border border-[#E8D9CD] hover:border-[#1F4D3A] hover:bg-[#FFF8F0] text-[#1F4D3A] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
              aria-label="Next featured products"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with CSS Snap */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {products.map((p, idx) => (
            <div
              key={p.id}
              className="shrink-0 w-[78vw] sm:w-[45vw] md:w-[31vw] lg:w-[23.5%] snap-start"
            >
              <ProductCard product={p} priority={idx === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
