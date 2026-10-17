"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({
  faqs,
  title = "Frequently Asked Questions",
  description,
}: {
  faqs: FaqItemData[];
  title?: string;
  description?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // JSON-LD schema for FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-12 sm:py-16">
      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight font-display">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-[#6B6560] max-w-xl mx-auto">{description}</p>
          )}
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#1F4D3A] shadow-sm"
                    : "bg-white border-[#E8D9CD] hover:border-[#1F4D3A]/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#2B2622] select-none hover:text-[#1F4D3A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4D3A]"
                >
                  <span className="pr-4">{faq.question}</span>
                  <span
                    className={`ml-2 shrink-0 p-1.5 rounded-full border transition-transform duration-200 ${
                      isOpen
                        ? "bg-[#1F4D3A] text-white border-[#1F4D3A] rotate-180"
                        : "bg-[#FFF8F0] text-[#1F4D3A] border-[#E8D9CD]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-[#6B6560] leading-relaxed border-t border-[#E8D9CD]/40 animate-in fade-in-50 duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
