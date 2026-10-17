import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShieldCheck, Lock, Eye, Database, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | PetsWorld.pk",
  description:
    "PetsWorld Pakistan's commitment to customer privacy, data encryption, secure order processing, and payment details protection.",
  alternates: {
    canonical: "https://petsworld.pk/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight font-display">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-[#6B6560] leading-relaxed">
            How PetsWorld Pakistan collects, safeguards, and utilizes your delivery and purchase information.
          </p>
        </div>

        {/* 3 Privacy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-2">
            <Lock className="w-6 h-6 text-[#1F4D3A]" />
            <h3 className="font-bold text-sm text-[#2B2622]">Encrypted Storage</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Order and customer credentials are protected with industry-standard TLS encryption and zero-knowledge storage protocols.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-2">
            <Eye className="w-6 h-6 text-[#1F4D3A]" />
            <h3 className="font-bold text-sm text-[#2B2622]">No Third-Party Sharing</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              We never sell or rent your personal contact information to advertisers, telemarketers, or unauthorized third parties.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-xs space-y-2">
            <Database className="w-6 h-6 text-[#1F4D3A]" />
            <h3 className="font-bold text-sm text-[#2B2622]">Confidential Receipts</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Payment transfer screenshots are stored in private database storage, accessible solely to verified store finance admins.
            </p>
          </div>
        </div>

        {/* Detailed Policy Text */}
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-10 shadow-xs space-y-8 text-sm text-[#3E3834] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">1. Information We Collect</h2>
            <p>
              When you place an order on PetsWorld.pk, we collect your full name, Pakistani mobile number, delivery address, and optionally your email address. This information is strictly required to route courier deliveries and communicate order status notifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">2. Payment Security</h2>
            <p>
              We do not store your credit card or banking PIN numbers on our servers. For manual bank transfers, Easypaisa, and JazzCash, transaction references and transaction receipts uploaded during checkout are used solely by our finance team to reconcile your deposit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">3. Courier Logistics Disclosure</h2>
            <p>
              To complete home delivery, your delivery address, recipient name, and Pakistani phone number are shared securely with our designated logistics partners (e.g. TCS, Leopard Courier) exclusively for the execution of the delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#1F4D3A] font-display">4. Account Rights & Data Deletion</h2>
            <p>
              You have the right to request review, correction, or permanent deletion of your customer record at any time. Simply reach out to our privacy officer via email at <strong>privacy@petsworld.pk</strong> or contact customer care.
            </p>
          </section>

          <div className="pt-4 border-t border-[#E8D9CD] flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-[#6B6560]">
              Have questions regarding data safety or privacy policies?
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D3A] hover:bg-[#163B2C] text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Contact Privacy Officer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
