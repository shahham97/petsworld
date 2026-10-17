import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | PetsWorld.pk",
  description:
    "Information on delivery timelines, shipping charges, Cash on Delivery (COD), and nationwide courier coverage across Pakistan at PetsWorld.",
  alternates: {
    canonical: "https://petsworld.pk/shipping",
  },
};

export default function ShippingPolicyPage() {
  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        <Breadcrumbs items={[{ label: "Shipping & Delivery" }]} />

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] text-xs font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>Nationwide Coverage</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight font-display">
            Shipping & Delivery Policy
          </h1>

          <p className="text-sm sm:text-base text-[#6B6560] leading-relaxed">
            Fast, reliable delivery of authentic pet food and accessories to doorsteps across Pakistan.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center text-[#1F4D3A]">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2B2622]">Delivery Timelines</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              <strong>Lahore:</strong> 24 to 48 hours.<br />
              <strong>Major Cities:</strong> 2 to 4 business days (Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta).
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center text-[#1F4D3A]">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2B2622]">Free Delivery</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Orders over <strong>Rs. 3,000</strong> qualify for 100% Free Shipping anywhere in Pakistan. Standard flat fee of Rs. 250 applies on smaller orders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center text-[#1F4D3A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#2B2622]">Secure Packaging</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Heavy pet kibble sacks, glass jars, and delicate items are carefully sealed with bubble wrap and moisture-proof outer cartons.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-10 shadow-xs space-y-8 text-sm text-[#3E3834] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">1. Courier Partners & Tracking</h2>
            <p>
              We partner with top-tier courier logistics providers in Pakistan (TCS, Leopard Courier, Call Courier, and M&P) to ensure your pet essentials arrive promptly. Once your parcel is dispatched from our Lahore warehouse, you will receive an SMS and WhatsApp tracking update with a direct tracking link.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">2. Cash on Delivery (COD) Inspection</h2>
            <p>
              When receiving an order via Cash on Delivery, please ensure the external package is intact before handing payment to the delivery rider. If you suspect tampering or transit damage, note it with the rider and immediately notify our helpline at <strong>0300-1234567</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">3. Unserviceable or Remote Locations</h2>
            <p>
              While we deliver to over 250+ cities, towns, and tehsils across Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, and Islamabad Capital Territory, certain remote or rural areas may require collection from the nearest courier branch office.
            </p>
          </section>

          <div className="pt-4 border-t border-[#E8D9CD] flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-[#6B6560]">
              Need to check the status of an ongoing order?
            </div>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D3A] hover:bg-[#163B2C] text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Track Your Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
