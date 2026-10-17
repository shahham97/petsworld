"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Star, Check } from "lucide-react";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  price: number | string;
  salePrice?: number | string | null;
  stockQty: number;
  lowStockThreshold?: number;
  imageAssetId?: string | null;
  blurDataUrl?: string | null;
  rating?: number;
  reviewCount?: number;
}

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const priceNum = typeof product.price === "number" ? product.price : parseFloat(product.price);
  const saleNum = product.salePrice
    ? typeof product.salePrice === "number"
      ? product.salePrice
      : parseFloat(product.salePrice)
    : null;

  const isOutOfStock = product.stockQty <= 0;
  const isSale = saleNum !== null && saleNum < priceNum;
  const discountPercent = isSale ? Math.round(((priceNum - saleNum) / priceNum) * 100) : 0;

  // Uses thumb variant for listing cards (never lg)
  const imageUrl = product.imageAssetId
    ? `/media/${product.imageAssetId}/thumb`
    : "/images/hero-pets.webp";

  return (
    <div className="group relative rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#1F4D3A]/40 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Top Media & Badges */}
      <div className="relative aspect-square w-full bg-[#FFF8F0] overflow-hidden" style={{ position: "relative" }}>
        <Link
          href={`/product/${product.slug}`}
          className="relative block w-full h-full"
          style={{ position: "relative" }}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges Top Left / Right */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {isSale && (
            <span className="px-2.5 py-1 rounded-full bg-[#D98E3F] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              Save {discountPercent}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full bg-[#8E281C] text-white text-[11px] font-bold">
              Sold Out
            </span>
          ) : product.stockQty <= 5 ? (
            <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-bold">
              Only {product.stockQty} Left
            </span>
          ) : null}
        </div>
      </div>

      {/* Info & Purchase */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div>
          {product.brand && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#D98E3F] block mb-0.5 sm:mb-1">
              {product.brand}
            </span>
          )}

          <Link href={`/product/${product.slug}`} className="block group-hover:text-[#1F4D3A] transition-colors">
            <h3 className="font-bold text-[#2B2622] text-xs sm:text-sm md:text-base leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-[#E8D9CD]/60 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            {isSale ? (
              <div className="flex flex-col">
                <span className="text-sm sm:text-base md:text-lg font-black text-[#1F4D3A] leading-tight truncate">
                  Rs. {saleNum.toLocaleString("en-PK")}
                </span>
                <span className="text-[10px] sm:text-xs text-[#6B6560] line-through">
                  Rs. {priceNum.toLocaleString("en-PK")}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base md:text-lg font-black text-[#2B2622] truncate block">
                Rs. {priceNum.toLocaleString("en-PK")}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => addItem(product.id, 1)}
            disabled={isOutOfStock}
            className={`shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? "bg-[#E8D9CD] text-[#6B6560] cursor-not-allowed"
                : "bg-[#1F4D3A] text-white hover:bg-[#163B2C] hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
