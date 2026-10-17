import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { HelpCircle, PhoneCall, Mail, MessageCircle, ShieldCheck } from "lucide-react";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Help & Frequently Asked Questions | PetsWorld.pk",
  description:
    "Find answers to common questions about pet food delivery in Pakistan, payment methods (Cash on Delivery, Easypaisa, JazzCash), orders, and product authenticity.",
  alternates: {
    canonical: "https://petsworld.pk/faq",
  },
};

export default async function FaqPage() {
  // Query all active global FAQs ordered by sortOrder
  const faqs = await db.faq.findMany({
    where: { isActive: true, scopeType: "GLOBAL" },
    orderBy: { sortOrder: "asc" },
  });

  const settings = await db.storeSettings.findUnique({
    where: { id: "default" },
    select: {
      phone: true,
      email: true,
      whatsAppNumber: true,
      whatsAppEnabled: true,
    },
  });

  // Fallback FAQs if DB has none seeded
  const displayFaqs =
    faqs.length > 0
      ? faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))
      : [
          {
            id: "faq-1",
            question: "How long does delivery take across Pakistan?",
            answer:
              "Orders in Lahore are typically delivered within 24 to 48 hours. Deliveries to Karachi, Islamabad, Rawalpindi, and other nationwide destinations take 2 to 4 business days via verified courier services.",
          },
          {
            id: "faq-2",
            question: "What payment methods do you accept?",
            answer:
              "We accept Cash on Delivery (COD), Easypaisa, JazzCash, and direct online Bank Transfer. You can select your preferred payment method during checkout.",
          },
          {
            id: "faq-3",
            question: "Are your pet foods and supplies 100% genuine?",
            answer:
              "Yes. We source all nutritional pet formulas, prescription diets, and accessories exclusively from authorized Pakistani importers and manufacturers with verifiable batch numbers.",
          },
          {
            id: "faq-4",
            question: "What is your return and refund policy?",
            answer:
              "We offer a 7-day return policy on unopened, undamaged pet items in their original packaging. If you received the wrong item or a damaged package, reach out to our team immediately for a replacement or full refund.",
          },
        ];

  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        <Breadcrumbs items={[{ label: "Help & FAQs" }]} />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#2B2622] tracking-tight font-display">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base text-[#6B6560] leading-relaxed">
            Quick answers about order delivery across Pakistan, payment verification, product quality, and returns.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-10 shadow-xs">
          <FaqAccordion faqs={displayFaqs} title="Customer Queries & Answers" />
        </div>

        {/* Contact Assistance Callout */}
        <div className="bg-[#1F4D3A] text-white rounded-3xl p-8 sm:p-10 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D98E3F]">
                <ShieldCheck className="w-4 h-4" />
                <span>Need Personalized Help?</span>
              </div>
              <h2 className="text-2xl font-black font-display">Still have questions?</h2>
              <p className="text-sm text-[#F4DFCB]/80 max-w-md">
                Our pet care support team is available Monday through Saturday (9am - 8pm PKT) to assist you with diet selection or order tracking.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1F4D3A] font-bold text-xs shadow-sm hover:bg-[#FFF8F0] transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {settings.phone}</span>
                </a>
              )}

              {settings?.whatsAppEnabled && settings?.whatsAppNumber && (
                <a
                  href={`https://wa.me/${settings.whatsAppNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs shadow-sm hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Us</span>
                </a>
              )}

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white/20 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send a Message</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
