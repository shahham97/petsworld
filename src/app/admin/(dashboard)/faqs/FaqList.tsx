"use client";

import React, { useTransition } from "react";
import { toggleFaqActiveAction, deleteFaqAction } from "@/actions/faq-actions";
import { FaqFormModal } from "./FaqFormModal";
import { useToast } from "@/components/ui/Toast";
import { Edit2, Trash2 } from "lucide-react";

export function FaqList({ faqs }: { faqs: any[] }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleToggle = (id: string, currentState: boolean) => {
    startTransition(async () => {
      const res = await toggleFaqActiveAction(id, !currentState);
      if (res.success) toast.success("FAQ visibility updated.");
      else toast.error(res.error || "Failed to update.");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    startTransition(async () => {
      const res = await deleteFaqAction(id);
      if (res.success) toast.success("FAQ deleted.");
      else toast.error(res.error || "Failed to delete.");
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8D9CD] divide-y divide-[#E8D9CD] shadow-sm">
      {faqs.map((faq) => (
        <div key={faq.id} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[#FFF8F0]/30 transition-colors">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#FFF8F0] border border-[#E8D9CD] text-[10px] font-bold text-[#1F4D3A] uppercase">
                {faq.scopeType} {faq.scopeKey ? `(${faq.scopeKey})` : ""}
              </span>
              <span className="text-[10px] text-[#6B6560] font-mono">Order: #{faq.sortOrder}</span>
            </div>
            <h3 className="font-bold text-[#2B2622] text-sm">{faq.question}</h3>
            <p className="text-xs text-[#6B6560] leading-relaxed">{faq.answer}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleToggle(faq.id, faq.isActive)}
              disabled={isPending}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                faq.isActive ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#6B7280]"
              }`}
            >
              {faq.isActive ? "Active" : "Hidden"}
            </button>

            <FaqFormModal
              faq={faq}
              trigger={
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#1F4D3A] hover:bg-[#F4DFCB]/60 transition-colors"
                  title="Edit FAQ"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              }
            />

            <button
              type="button"
              onClick={() => handleDelete(faq.id)}
              disabled={isPending}
              className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
              title="Delete FAQ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
