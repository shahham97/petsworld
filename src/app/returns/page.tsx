import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RotateCcw, AlertTriangle, CheckCircle, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refund Policy | PetsWorld.pk",
  description:
    "Learn about our 7-day hassle-free return and refund policy for pet food, accessories, and grooming essentials at PetsWorld Pakistan.",
  alternates: {
    canonical: "https://petsworld.pk/returns",
  },
};

export default function ReturnsPolicyPage() {
  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        <Breadcrumbs items={[{ label: "Returns & Refunds" }]} />

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] text-xs font-bold">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Customer Satisfaction Guarantee</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight font-display">
            Returns & Refund Policy
          </h1>

          <p className="text-sm sm:text-base text-[#6B6560] leading-relaxed">
            Hassle-free 7-day return guarantee for our pet parents across Pakistan.
          </p>
        </div>

        {/* 3 Step Return Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#1F4D3A] text-white text-xs font-black flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-[#2B2622]">Notify Us Within 7 Days</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Message us on WhatsApp (0300-1234567) or email info@petsworld.pk with your order number and photos of the unopened item.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#1F4D3A] text-white text-xs font-black flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-sm text-[#2B2622]">Courier Pickup or Return</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              We will arrange a courier pickup from your address in major cities or provide shipping instructions to our central hub.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#1F4D3A] text-white text-xs font-black flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-sm text-[#2B2622]">Fast 48-Hour Refund</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Upon parcel receipt and verification, your refund is processed directly via Easypaisa, JazzCash, or online bank transfer within 48 hours.
            </p>
          </div>
        </div>

        {/* Policy Details */}
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-10 shadow-xs space-y-8 text-sm text-[#3E3834] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">1. Eligibility for Returns</h2>
            <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm">
              <li>Item must be unopened, with original manufacturer seals intact.</li>
              <li>Packaging, labels, and included accessories must be in original, unblemished condition.</li>
              <li>Proof of purchase (PetsWorld Order Number or digital invoice) must be provided.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">2. Damaged or Incorrect Products</h2>
            <p>
              If you received a damaged product, expired batch, or incorrect formula, PetsWorld covers 100% of the return and replacement courier charges. Please take clear photos of the defect and send them to our support team within 48 hours of parcel receipt.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">3. Non-Returnable Items</h2>
            <p>
              For hygiene, pet health, and bio-security reasons, opened bags of food, used pet litter boxes, opened medication/supplements, and customized pet tags cannot be returned once opened.
            </p>
          </section>

          <div className="pt-4 border-t border-[#E8D9CD] flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-[#6B6560]">
              Have a question about a specific item or exchange?
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D3A] hover:bg-[#163B2C] text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Contact Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
