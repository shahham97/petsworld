import React from "react";
import { redirect } from "next/navigation";
import { getCheckoutSessionAction } from "@/actions/checkout-actions";
import { CheckoutWizard } from "@/components/checkout/CheckoutWizard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShieldCheck, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const res = await getCheckoutSessionAction();

  if (!res.success || !res.session) {
    redirect("/cart");
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart" },
    { label: "Checkout", href: "/checkout" },
  ];

  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight font-display">
              Secure Checkout
            </h1>
            <p className="text-xs text-[#6B6560] mt-0.5">
              Encrypted transaction protected by PetsWorld Pakistan
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#1F4D3A] bg-white px-3 py-1.5 rounded-xl border border-[#E8D9CD]">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        <CheckoutWizard
          initialSession={res.session}
          paymentMethods={res.paymentMethods || []}
          storeSettings={res.storeSettings}
        />
      </div>
    </div>
  );
}
