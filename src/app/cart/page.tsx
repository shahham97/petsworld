"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { syncCartItemsAction, initCheckoutSessionAction } from "@/actions/checkout-actions";
import { ShoppingBag, Trash2, ArrowRight, Truck, Plus, Minus, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function CartPage() {
  const router = useRouter();
  const toast = useToast();
  const { items: cartState, updateQuantity, removeItem, clearCart } = useCart();
  const [syncedData, setSyncedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, startCheckoutTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;
    async function loadLiveCart() {
      if (cartState.length === 0) {
        setSyncedData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const res = await syncCartItemsAction(cartState);
      if (isMounted) {
        setSyncedData(res);
        setIsLoading(false);
      }
    }

    loadLiveCart();
    return () => {
      isMounted = false;
    };
  }, [cartState]);

  const handleCheckout = () => {
    if (!cartState || cartState.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    startCheckoutTransition(async () => {
      const res = await initCheckoutSessionAction(cartState);
      if (res.success) {
        router.push("/checkout");
      } else {
        toast.error(res.error || "Could not start checkout. Please review your cart items.");
      }
    });
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shopping Cart", href: "/cart" },
  ];

  if (isLoading) {
    return (
      <div className="bg-[#FFF8F0]/30 min-h-[60vh] py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1F4D3A] animate-spin" />
          <p className="text-xs font-semibold text-[#6B6560]">Updating live inventory and pricing...</p>
        </div>
      </div>
    );
  }

  const items = syncedData?.items || [];
  const subtotal = syncedData?.subtotal || 0;
  const freeThreshold = syncedData?.freeShippingThreshold || 3000;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const shippingFee = syncedData?.shippingFee || 0;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight font-display">
            Shopping Cart
          </h1>
          <p className="text-xs text-[#6B6560] mt-1">
            Review your selected pet food and essentials before proceeding to checkout
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-12 sm:p-16 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <ShoppingBag className="w-16 h-16 text-[#1F4D3A]/20 mx-auto" />
            <h2 className="text-xl font-bold text-[#2B2622]">Your Cart is Empty</h2>
            <p className="text-xs text-[#6B6560] max-w-md mx-auto leading-relaxed">
              Looks like you haven&apos;t added any pet products to your cart yet. Explore our verified cat, dog, and bird supplies!
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 transition-all"
              >
                <span>Browse Pet Store</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Alert Bar */}
              <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#D98E3F] shrink-0" />
                <div className="text-xs text-[#2B2622] flex-1">
                  {remainingForFree > 0 ? (
                    <span>
                      Add <strong className="font-bold text-[#1F4D3A]">Rs. {remainingForFree.toLocaleString("en-PK")}</strong> more of items to qualify for <strong>FREE Delivery</strong> across Pakistan!
                    </span>
                  ) : (
                    <span className="font-bold text-[#1F4D3A]">
                      🎉 You qualify for FREE Delivery across Pakistan!
                    </span>
                  )}
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-xs divide-y divide-[#E8D9CD]">
                {items.map((item: any) => {
                  const isOutOfStock = item.stockQty < item.quantity;
                  const thumb = item.imageAssetId
                    ? `/media/${item.imageAssetId}/thumb`
                    : "/images/hero-pets.webp";

                  return (
                    <div
                      key={item.productId}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/product/${item.slug}`}
                          className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#FFF8F0] border border-[#E8D9CD] shrink-0"
                          style={{ position: "relative" }}
                        >
                          <Image
                            src={thumb}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        <div className="space-y-1">
                          {item.brand && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D98E3F]">
                              {item.brand}
                            </span>
                          )}
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-sm font-bold text-[#2B2622] hover:text-[#1F4D3A] transition-colors block line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <div className="text-xs text-[#6B6560]">
                            Unit Price:{" "}
                            <span className="font-semibold text-[#2B2622]">
                              Rs. {item.unitPrice.toLocaleString("en-PK")}
                            </span>
                          </div>

                          {isOutOfStock && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Only {item.stockQty} in stock!</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity & Subtotal Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-[#E8D9CD]/50">
                        <div className="flex items-center border border-[#E8D9CD] rounded-xl overflow-hidden bg-[#FFF8F0]/50">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 hover:bg-[#F4DFCB]/60 text-[#2B2622] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-[#2B2622]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stockQty}
                            className="p-2 hover:bg-[#F4DFCB]/60 text-[#2B2622] transition-colors disabled:opacity-30 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <div className="text-sm font-black text-[#1F4D3A]">
                            Rs. {item.lineTotal.toLocaleString("en-PK")}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-2 rounded-xl text-[#6B6560] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-[#6B6560] hover:text-red-600 font-medium underline cursor-pointer"
                >
                  Clear Entire Cart
                </button>
                <Link
                  href="/shop"
                  className="text-xs font-bold text-[#1F4D3A] hover:underline"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right 4 Cols: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-6 shadow-xs sticky top-28">
                <h2 className="text-lg font-black text-[#2B2622] font-display pb-3 border-b border-[#E8D9CD]">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-[#6B6560]">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-[#2B2622]">
                      Rs. {subtotal.toLocaleString("en-PK")}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#6B6560]">
                    <span>Standard Shipping</span>
                    <span className="font-bold text-[#2B2622]">
                      {shippingFee === 0 ? (
                        <span className="text-[#1F4D3A]">FREE</span>
                      ) : (
                        `Rs. ${shippingFee.toLocaleString("en-PK")}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E8D9CD] flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#2B2622]">Estimated Total</span>
                    <span className="text-xl font-black text-[#1F4D3A]">
                      Rs. {total.toLocaleString("en-PK")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#1F4D3A] hover:bg-[#163B2C] text-white text-xs font-bold tracking-wide shadow-md shadow-[#1F4D3A]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Locking In Cart...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-[11px] text-[#6B6560] text-center space-y-1 pt-2">
                  <p>✓ Cash on Delivery & Mobile Wallets Accepted</p>
                  <p>✓ Fast express shipping across Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
