"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag, Zap, Minus, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  productId: string;
  price: number;
  salePrice: number | null;
  stockQty: number;
}

export function ProductPurchaseBox({ productId, price, salePrice, stockQty }: Props) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  const isOutOfStock = stockQty <= 0;
  const isSale = salePrice !== null && salePrice < price;
  const savings = isSale ? price - salePrice : 0;
  const currentPrice = isSale ? salePrice : price;

  const handleDecrement = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrement = () => {
    if (qty < stockQty) setQty(qty + 1);
  };

  const handleAddToCart = () => {
    addItem(productId, qty);
  };

  const handleBuyNow = () => {
    addItem(productId, qty);
    router.push("/checkout");
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm space-y-6">
      {/* Price Display */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-[#1F4D3A] tracking-tight">
            Rs. {currentPrice.toLocaleString("en-PK")}
          </span>
          {isSale && (
            <span className="text-base text-[#6B6560] line-through">
              Rs. {price.toLocaleString("en-PK")}
            </span>
          )}
        </div>

        {isSale && (
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
            You save Rs. {savings.toLocaleString("en-PK")}
          </span>
        )}
      </div>

      {/* Stock Availability */}
      <div className="flex items-center gap-2 text-xs font-bold">
        {isOutOfStock ? (
          <div className="flex items-center gap-1.5 text-[#DC2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Currently Out of Stock</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#16A34A]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>In Stock ({stockQty} units ready in warehouse)</span>
          </div>
        )}
      </div>

      {/* Quantity Selector & Purchase Buttons */}
      {!isOutOfStock && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase text-[#2B2622]">Quantity</span>
            <div className="flex items-center rounded-2xl border border-[#E8D9CD] bg-[#FFF8F0] p-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={qty <= 1}
                className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#2B2622] hover:bg-[#F4DFCB]/60 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-[#2B2622]">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={qty >= stockQty}
                className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#2B2622] hover:bg-[#F4DFCB]/60 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#FFF8F0] border-2 border-[#1F4D3A] text-[#1F4D3A] text-sm font-bold hover:bg-[#F4DFCB]/50 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#1F4D3A] text-white text-sm font-bold hover:bg-[#163B2C] shadow-lg shadow-[#1F4D3A]/25 transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#D98E3F] fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
