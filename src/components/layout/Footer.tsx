import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PetsWorldLogo } from "@/components/brand/PetsWorldLogo";
import { Banknote, ShieldCheck } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1F4D3A] text-[#FFF8F0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2D664F]">
          {/* Brand Column */}
          <div className="space-y-4">
            <PetsWorldLogo variant="light" />
            <p className="text-sm text-[#F4DFCB]/80 leading-relaxed max-w-xs">
              Pakistan&apos;s trusted pet store for premium nutrition, genuine accessories, and care essentials for cats, dogs, and birds.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D98E3F] font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>100% Genuine & Authentic Products</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#F4DFCB] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FFF8F0]/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop All Supplies
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Pet Care Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#F4DFCB] mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FFF8F0]/80">
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Pakistan Coverage */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#F4DFCB] mb-4">
              Nationwide Delivery
            </h3>
            <p className="text-sm text-[#F4DFCB]/80 mb-3">
              Fast shipping across Lahore, Karachi, Islamabad, Rawalpindi, and all major cities of Pakistan.
            </p>
            <div className="space-y-2 text-sm text-[#FFF8F0]/90">
              <p>
                <strong className="text-[#F4DFCB]">Helpline:</strong> 0300-1234567
              </p>
              <p>
                <strong className="text-[#F4DFCB]">Email:</strong> info@petsworld.pk
              </p>
              <p>
                <strong className="text-[#F4DFCB]">Hours:</strong> Mon - Sat, 9am - 8pm PKT
              </p>
            </div>
          </div>
        </div>

        {/* Payment Badges & Copyright Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Payment Badges - Real World Payment Options */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="text-xs text-[#F4DFCB]/70 font-medium mr-1">Payment Methods:</span>
            {/* Cash on Delivery (COD) Badge */}
            <div
              title="Cash on Delivery (COD)"
              aria-label="Cash on Delivery"
              className="h-8 px-3 rounded-xl bg-[#173B2C] border border-[#2D664F] flex items-center gap-1.5 shadow-xs hover:border-[#D98E3F]/80 transition-colors"
            >
              <Banknote className="w-4 h-4 text-[#D98E3F]" aria-hidden="true" />
              <span className="text-[11px] font-black tracking-wider text-[#F4DFCB]">COD</span>
            </div>
            {/* Real World Easypaisa Badge */}
            <div
              title="Easypaisa"
              aria-label="Easypaisa"
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all shadow-xs"
            >
              <Image
                src="/images/payments/easypaisa.png"
                alt="Easypaisa Payment Option"
                width={24}
                height={24}
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>
            {/* Real World JazzCash Badge */}
            <div
              title="JazzCash"
              aria-label="JazzCash"
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all shadow-xs"
            >
              <Image
                src="/images/payments/jazzcash.png"
                alt="JazzCash Payment Option"
                width={24}
                height={24}
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>
            {/* Real World Bank Transfer Badge */}
            <div
              title="Bank Transfer"
              aria-label="Bank Transfer"
              className="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all shadow-xs"
            >
              <Image
                src="/images/payments/bank-transfer.png"
                alt="Bank Transfer Payment Option"
                width={24}
                height={24}
                unoptimized
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-[#F4DFCB]/60 text-center md:text-right">
            &copy; {currentYear} PetsWorld.pk. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
