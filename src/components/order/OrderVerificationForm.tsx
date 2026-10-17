"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyOrderOwnershipAction } from "@/actions/checkout-actions";
import { ShieldAlert, Loader2, ArrowRight } from "lucide-react";

export function OrderVerificationForm({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await verifyOrderOwnershipAction(orderNumber, identifier);
      if (res.success && res.token) {
        router.push(`/order/${orderNumber}?token=${res.token}`);
      } else {
        setErrorMsg(res.error || "Verification failed. Please check your phone number or email.");
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8D9CD] p-8 max-w-md mx-auto space-y-6 shadow-sm text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center mx-auto text-[#1F4D3A]">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-black text-[#2B2622] font-display">
          Verify Order Ownership
        </h2>
        <p className="text-xs text-[#6B6560]">
          To protect customer privacy and prevent order enumeration, please verify the contact information used for order <span className="font-mono font-bold text-[#2B2622]">{orderNumber}</span>.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
            Phone Number or Email *
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="03001234567 or email@domain.com"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Verify & View Order</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
