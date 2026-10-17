"use client";

import React, { useState, useTransition } from "react";
import { savePageSeoAction } from "@/actions/seo-actions";
import { useToast } from "@/components/ui/Toast";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Save, Loader2, Globe } from "lucide-react";
import Image from "next/image";

interface PageSeoItem {
  id?: string;
  pageKey: string;
  seoTitle: string;
  seoDescription: string;
  editableIntroText: string | null;
  ogAssetId: string | null;
}

export function SeoFormCard({ pageSeo }: { pageSeo: PageSeoItem }) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    pageKey: pageSeo.pageKey,
    seoTitle: pageSeo.seoTitle || "",
    seoDescription: pageSeo.seoDescription || "",
    editableIntroText: pageSeo.editableIntroText || "",
    ogAssetId: pageSeo.ogAssetId || null,
  });

  const pageDisplayNames: Record<string, string> = {
    home: "Homepage (/) ",
    shop: "Catalog Shop (/shop)",
    categories: "Categories (/categories)",
    blog: "Blog Index (/blog)",
    contact: "Contact Us (/contact)",
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await savePageSeoAction(form);
      if (res.success) {
        toast.success(`SEO updated for ${form.pageKey.toUpperCase()}.`);
      } else {
        toast.error(res.error || "Failed to update SEO.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-4 shadow-xs"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E8D9CD]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#1F4D3A]" />
          <h3 className="font-bold text-sm text-[#2B2622]">
            {pageDisplayNames[form.pageKey] || form.pageKey}
          </h3>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-2xs cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#2B2622] uppercase">Meta Title</label>
            <span
              className={`text-[10px] font-mono ${
                form.seoTitle.length > 60 ? "text-amber-600 font-bold" : "text-[#6B6560]"
              }`}
            >
              {form.seoTitle.length}/60 chars
            </span>
          </div>
          <input
            type="text"
            required
            value={form.seoTitle}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8D9CD] text-xs font-medium text-[#2B2622]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#2B2622] uppercase">Meta Description</label>
            <span
              className={`text-[10px] font-mono ${
                form.seoDescription.length > 160 ? "text-amber-600 font-bold" : "text-[#6B6560]"
              }`}
            >
              {form.seoDescription.length}/160 chars
            </span>
          </div>
          <textarea
            required
            rows={2}
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
            Page Intro / Header Banner Text
          </label>
          <textarea
            rows={2}
            value={form.editableIntroText}
            onChange={(e) => setForm({ ...form, editableIntroText: e.target.value })}
            placeholder="Subheading or descriptive text shown at the top of this public page"
            className="w-full px-3.5 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
          />
        </div>

        {/* SERP Snippet Preview */}
        <div className="p-3.5 rounded-2xl bg-[#FFF8F0]/70 border border-[#E8D9CD]/80 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D98E3F] block">
            Google Search Preview
          </span>
          <div className="text-xs font-semibold text-[#1a0dab] truncate">
            {form.seoTitle || "PetsWorld Pakistan"}
          </div>
          <div className="text-[11px] font-mono text-[#006621] truncate">
            https://petsworld.pk/{form.pageKey === "home" ? "" : form.pageKey}
          </div>
          <div className="text-[11px] text-[#545454] line-clamp-2">
            {form.seoDescription || "Pet supplies, food and accessories across Pakistan."}
          </div>
        </div>
      </div>
    </form>
  );
}
