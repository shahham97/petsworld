import React from "react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import { getCachedStoreSettings, getCachedPageSeo } from "@/lib/cached-data";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getCachedPageSeo("contact");
  return {
    title: seo?.seoTitle || "Contact PetsWorld | Pet Store Support in Pakistan",
    description:
      seo?.seoDescription ||
      "Questions about an order or a product? Contact PetsWorld by phone, WhatsApp or our inquiry form.",
  };
}

export default async function ContactPage() {
  const [settings, seo] = await Promise.all([
    getCachedStoreSettings(),
    getCachedPageSeo("contact"),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Contact Us", href: "/contact" },
  ];

  const whatsappUrl = `https://wa.me/${settings?.whatsAppNumber || "923001234567"}?text=${encodeURIComponent(
    settings?.whatsAppPrefilledMessage || "Hi PetsWorld! I have a question about pet supplies."
  )}`;

  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight font-display">
            We&apos;re Here to Help
          </h1>
          <p className="text-sm text-[#6B6560] leading-relaxed">
            {seo?.editableIntroText ||
              "Whether you need product advice for your furry companion or updates on your delivery, our friendly Lahore team is ready to assist."}
          </p>
        </div>

        {/* 4 Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#25D366] transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B2622] group-hover:text-[#25D366] transition-colors">
                  WhatsApp Support
                </h3>
                <p className="text-xs text-[#6B6560] mt-0.5">Instant chat assistance</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#1F4D3A] font-mono pt-4">
              +{settings?.whatsAppNumber || "923001234567"}
            </span>
          </a>

          <a
            href={`tel:${settings?.phone || "03001234567"}`}
            className="group p-5 rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#1F4D3A] transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1F4D3A]/10 text-[#1F4D3A] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B2622] group-hover:text-[#1F4D3A] transition-colors">
                  Phone Hotline
                </h3>
                <p className="text-xs text-[#6B6560] mt-0.5">Mon - Sat: 9:00 AM - 8:00 PM</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#1F4D3A] font-mono pt-4">
              {settings?.phone || "03001234567"}
            </span>
          </a>

          <a
            href={`mailto:${settings?.email || "info@petsworld.pk"}`}
            className="group p-5 rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#D98E3F] transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D98E3F]/10 text-[#D98E3F] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B2622] group-hover:text-[#D98E3F] transition-colors">
                  Email Inquiries
                </h3>
                <p className="text-xs text-[#6B6560] mt-0.5">Replies within 1 business day</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#1F4D3A] pt-4 truncate">
              {settings?.email || "info@petsworld.pk"}
            </span>
          </a>

          <div className="p-5 rounded-3xl bg-white border border-[#E8D9CD] shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1F4D3A]/10 text-[#1F4D3A] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B2622]">Logistics Center</h3>
                <p className="text-xs text-[#6B6560] mt-0.5">Order fulfillment hub</p>
              </div>
            </div>
            <span className="text-xs font-medium text-[#2B2622] pt-4 line-clamp-1">
              {settings?.address || "Lahore, Pakistan"}
            </span>
          </div>
        </div>

        {/* Form & FAQ strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-base font-bold text-[#2B2622] font-display">
              Quick Customer Assurance
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <Clock className="w-4 h-4 text-[#D98E3F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#2B2622]">Prompt Order Processing</h4>
                  <p className="text-[#6B6560] leading-relaxed mt-0.5">
                    Orders confirmed before 2:00 PM are dispatched on the same business day across Pakistan.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck className="w-4 h-4 text-[#1F4D3A] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#2B2622]">Guaranteed Fresh Batches</h4>
                  <p className="text-[#6B6560] leading-relaxed mt-0.5">
                    All dry kibble, wet food, and bird seeds have long expiry dates inspected before packing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
