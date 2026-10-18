"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { syncCartItemsAction, initCheckoutSessionAction } from "@/actions/checkout-actions";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Truck,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function CartDrawer() {
  const router = useRouter();
  const toast = useToast();
  const { items: cartState, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCart();
  const [syncedData, setSyncedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, startCheckoutTransition] = useTransition();

  // Sync cart items with database pricing & stock whenever drawer opens or items change
  useEffect(() => {
    let isMounted = true;
    if (!isDrawerOpen) return;

    if (cartState.length === 0) {
      setSyncedData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    syncCartItemsAction(cartState)
      .then((res) => {
        if (isMounted) {
          setSyncedData(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDrawerOpen, cartState]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const handleCheckout = () => {
    if (!cartState || cartState.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    startCheckoutTransition(async () => {
      const res = await initCheckoutSessionAction(cartState);
      if (res.success) {
        closeDrawer();
        router.push("/checkout");
      } else {
        toast.error(res.error || "Could not start checkout. Please review your cart items.");
      }
    });
  };

  if (!isDrawerOpen) return null;

  const items = syncedData?.items || [];
  const subtotal = syncedData?.subtotal || 0;
  const freeThreshold = syncedData?.freeShippingThreshold || 3000;
  const remainingForFree = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Dimmed backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-out side cart panel */}
      <div
        id="side-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className="relative w-full max-w-md bg-[#FFF8F0] shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300 border-l border-[#E8D9CD]"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8D9CD] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#1F4D3A]" />
            <h2 className="text-base sm:text-lg font-black text-[#2B2622] font-display">
              Shopping Cart
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#1F4D3A] text-white text-xs font-bold">
              {cartState.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-full text-[#6B6560] hover:text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        {cartState.length > 0 && (
          <div className="px-5 py-3 bg-[#FAF5EE] border-b border-[#E8D9CD] shrink-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#1F4D3A]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#D98E3F]" />
                {remainingForFree > 0
                  ? `Add Rs. ${remainingForFree.toLocaleString()} more for FREE Delivery`
                  : "🎉 Congratulations! You have FREE Delivery!"}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E8D9CD] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1F4D3A] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading && items.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#1F4D3A] animate-spin" />
              <p className="text-xs font-semibold text-[#6B6560]">Updating cart items...</p>
            </div>
          ) : cartState.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#2B2622]">Your cart is empty</h3>
                <p className="text-xs text-[#6B6560] mt-1 max-w-xs mx-auto">
                  Looks like you haven&apos;t added any pet food or accessories yet.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1F4D3A] text-white text-xs font-bold shadow-sm hover:bg-[#163B2C] transition-all"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div
                  key={item.productId}
                  className="p-3 bg-white rounded-2xl border border-[#E8D9CD] flex gap-3 items-center shadow-2xs"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] overflow-hidden shrink-0">
                    {item.imageAssetId ? (
                      <Image
                        src={`/media/${item.imageAssetId}/thumb`}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#1F4D3A]/40">
                        PW
                      </div>
                    )}
                  </div>

                  {/* Info & Quantity */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeDrawer}
                      className="font-bold text-xs sm:text-sm text-[#2B2622] hover:text-[#1F4D3A] truncate block transition-colors"
                    >
                      {item.name}
                    </Link>

                    <div className="text-xs font-black text-[#1F4D3A]">
                      Rs. {item.unitPrice?.toLocaleString()}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center rounded-lg border border-[#E8D9CD] bg-[#FFF8F0] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#2B2622] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.stockQty != null && item.quantity >= item.stockQty}
                          className="px-2 py-1 text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-[#991B1B] hover:text-[#DC2626] transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Subtotal & CTAs */}
        {cartState.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E8D9CD] shrink-0 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B6560] font-medium">Subtotal</span>
              <span className="text-lg font-black text-[#1F4D3A]">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            <p className="text-[11px] text-[#6B6560] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F4D3A]" />
              <span>Taxes and shipping calculated at checkout</span>
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 px-6 rounded-full bg-[#1F4D3A] hover:bg-[#163B2C] active:scale-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full py-2.5 px-6 rounded-full bg-[#FAF5EE] hover:bg-[#F4DFCB]/60 text-[#2B2622] font-bold text-xs border border-[#E8D9CD] transition-all flex items-center justify-center text-center"
              >
                View Full Shopping Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
