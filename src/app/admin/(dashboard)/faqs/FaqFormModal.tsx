"use client";

import React, { useState, useTransition } from "react";
import { saveFaqAction } from "@/actions/faq-actions";
import { useToast } from "@/components/ui/Toast";
import { Plus, Edit2, X, Loader2, HelpCircle } from "lucide-react";

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  scopeType: "GLOBAL" | "PAGE" | "CATEGORY" | "PRODUCT" | "BLOG_POST";
  scopeKey?: string | null;
}

export function FaqFormModal({ faq, trigger }: { faq?: FaqItem; trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const [form, setForm] = useState<FaqItem>(
    faq || {
      question: "",
      answer: "",
      sortOrder: 0,
      isActive: true,
      scopeType: "GLOBAL",
      scopeKey: "global",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveFaqAction(form);
      if (res.success) {
        toast.success(faq?.id ? "FAQ updated." : "FAQ created.");
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to save FAQ.");
      }
    });
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)}>{trigger}</span>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New FAQ</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8D9CD]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8D9CD]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#1F4D3A]" />
                <h3 className="text-base font-bold text-[#2B2622]">
                  {faq?.id ? "Edit FAQ" : "Add New FAQ"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#2B2622]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g. Do you deliver across Pakistan?"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Clear, plain-language answer..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                    Scope Type
                  </label>
                  <select
                    value={form.scopeType}
                    onChange={(e) => setForm({ ...form, scopeType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622] bg-white"
                  >
                    <option value="GLOBAL">GLOBAL (All Pages)</option>
                    <option value="PAGE">PAGE Scoped</option>
                    <option value="CATEGORY">CATEGORY Scoped</option>
                    <option value="PRODUCT">PRODUCT Scoped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                    Scope Key / Slug
                  </label>
                  <input
                    type="text"
                    value={form.scopeKey || ""}
                    onChange={(e) => setForm({ ...form, scopeKey: e.target.value })}
                    placeholder="e.g. global, home, shop"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="faq-active"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1F4D3A]"
                  />
                  <label htmlFor="faq-active" className="text-xs font-semibold text-[#2B2622]">
                    Active
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8D9CD]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{faq?.id ? "Update FAQ" : "Save FAQ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
