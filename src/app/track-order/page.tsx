"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Search, PackageCheck, Truck, ShieldAlert, ArrowRight } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const clean = orderNumber.trim();
    if (!clean) {
      setErrorMsg("Please enter a valid PetsWorld order number.");
      return;
    }

    // Direct to order lookup page
    router.push(`/order/${encodeURIComponent(clean)}`);
  };

  return (
    <div className="flex flex-col bg-[#FFF8F0] min-h-[70vh]">
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        <Breadcrumbs items={[{ label: "Track Your Order" }]} />

        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] text-xs font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>Order Status Tracker</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight font-display">
            Track Your Pet Order
          </h1>

          <p className="text-sm text-[#6B6560] leading-relaxed">
            Enter your PetsWorld Order Reference Number to verify real-time preparation, verification, and dispatch status.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-10 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="order-number" className="block text-xs font-bold uppercase tracking-wider text-[#2B2622] mb-1.5">
                PetsWorld Order Number *
              </label>
              <div className="relative">
                <input
                  id="order-number"
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. PW-20261016-ABCD"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8D9CD] bg-[#FFF8F0]/30 text-base sm:text-sm font-mono text-[#2B2622] focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
                />
                <Search className="w-5 h-5 text-[#6B6560] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              <span className="text-[11px] text-[#6B6560] mt-1 block">
                Found on your order confirmation SMS, WhatsApp alert, or checkout summary screen.
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#1F4D3A] hover:bg-[#163B2C] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Track Order Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Info Box */}
          <div className="pt-6 border-t border-[#E8D9CD]/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#4A433D]">
            <div className="flex items-start gap-2.5">
              <PackageCheck className="w-4 h-4 text-[#1F4D3A] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-[#2B2622]">Dispatched via Courier?</strong>
                Tracking numbers (TCS, Leopard, Call Courier) are generated automatically upon warehouse packing.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#D98E3F] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-[#2B2622]">Need Help Finding Order ID?</strong>
                Contact our helpline via WhatsApp at <strong className="text-[#1F4D3A]">0300-1234567</strong> with your phone number.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
