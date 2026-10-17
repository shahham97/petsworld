import React from "react";
import { db } from "@/lib/db";
import { FaqList } from "./FaqList";
import { FaqFormModal } from "./FaqFormModal";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await db.faq.findMany({
    orderBy: [{ scopeType: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            Frequently Asked Questions ({faqs.length})
          </h1>
          <p className="text-sm text-[#6B6560] mt-1">
            Global and scoped FAQs with automatic FAQPage JSON-LD generation on public pages
          </p>
        </div>

        <FaqFormModal />
      </div>

      <FaqList faqs={faqs} />
    </div>
  );
}
