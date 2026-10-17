"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBlogPostAction } from "@/actions/blog-actions";
import { TiptapEditor } from "./TiptapEditor";
import { MediaPicker } from "./MediaPicker";
import { useToast } from "@/components/ui/Toast";
import { FieldError } from "@/components/ui/FieldError";
import { InlineAlert } from "@/components/ui/InlineAlert";
import Image from "next/image";
import { Save, Loader2, Sparkles, X, Plus, Trash2, FileText, Search } from "lucide-react";

export interface BlogEditorProps {
  initialData?: any;
  availableProducts: { id: string; name: string }[];
}

export function BlogEditor({ initialData, availableProducts }: BlogEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    coverAssetId: initialData?.coverAssetId || null,
    coverAlt: initialData?.coverAlt || "",
    content: initialData?.content || "<p>Write your pet care article here...</p>",
    authorName: initialData?.authorName || "PetsWorld Editorial Team",
    status: initialData?.status || "PUBLISHED",
    readingTimeMin: initialData?.readingTimeMin || 4,
    tags: initialData?.tags || "Nutrition, Cat Care, Tips",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    relatedProductIds: initialData?.relatedProducts?.map((r: any) => r.productId) || [],
    faqs: initialData?.faqs || [],
  });

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.id ? prev.slug : slug,
    }));
  };

  const autoFillSeo = () => {
    setForm((prev) => ({
      ...prev,
      seoTitle: `${prev.title} | PetsWorld Blog`.slice(0, 60),
      seoDescription: prev.excerpt.slice(0, 155),
    }));
    toast.info("Blog SEO title and description auto-filled.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await saveBlogPostAction(form);
      if (res.success) {
        toast.success(form.id ? "Article updated." : "Article published.");
        router.push("/admin/blog");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save post.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            {form.id ? `Edit Post: ${form.title}` : "Create New Blog Post"}
          </h1>
          <p className="text-xs text-[#6B6560] mt-1">
            Editorial layout with sticky Table of Contents and structured BlogPosting schema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="px-4 py-2.5 rounded-2xl border border-[#E8D9CD] bg-white text-xs font-bold text-[#6B6560] hover:bg-[#F4DFCB]/40 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{form.status === "PUBLISHED" ? "Save & Publish" : "Save Draft"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <InlineAlert type="error" title="Cannot Save Post">
          {errorMsg}
        </InlineAlert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Content & Excerpt */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Post Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Best Cat Food Brands in Pakistan: Complete Guide"
                className="w-full px-4 py-3 rounded-2xl border border-[#E8D9CD] text-lg font-bold text-[#2B2622]"
              />
              <FieldError error={fieldErrors.title} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm font-mono text-[#2B2622]"
              />
              <FieldError error={fieldErrors.slug} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Excerpt (Summary for cards & meta description) *
              </label>
              <textarea
                rows={3}
                required
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="A compelling 1-2 sentence overview answering the key question..."
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm text-[#2B2622]"
              />
              <FieldError error={fieldErrors.excerpt} />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Article Content (Tiptap Editor) *
              </label>
              <TiptapEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
              />
              <FieldError error={fieldErrors.content} />
            </div>
          </div>

          {/* Related Products Picker */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622]">Attach Recommended Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableProducts.map((p) => {
                const isChecked = form.relatedProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622] cursor-pointer hover:bg-[#FFF8F0]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setForm((prev) => ({
                          ...prev,
                          relatedProductIds: isChecked
                            ? prev.relatedProductIds.filter((id: string) => id !== p.id)
                            : [...prev.relatedProductIds, p.id],
                        }));
                      }}
                      className="w-4 h-4 rounded text-[#1F4D3A]"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cover Image, Meta, SEO */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622]">Publishing Details</h2>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622] bg-white font-semibold"
              >
                <option value="PUBLISHED">Published (Live Publicly)</option>
                <option value="DRAFT">Draft (Admin Preview Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Read Time (min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.readingTimeMin}
                  onChange={(e) => setForm({ ...form, readingTimeMin: parseInt(e.target.value) || 3 })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Nutrition, Grooming"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622]">Cover Photography</h2>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-[#E8D9CD] bg-[#FFF8F0]">
              {form.coverAssetId ? (
                <Image
                  src={`/media/${form.coverAssetId}/md`}
                  alt="Post cover"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#6B6560]">
                  No cover image selected
                </div>
              )}
            </div>

            <MediaPicker
              buttonLabel={form.coverAssetId ? "Change Cover Image" : "Select Cover Image"}
              selectedAssetId={form.coverAssetId}
              onSelect={(asset) => setForm({ ...form, coverAssetId: asset.id })}
            />
          </div>

          {/* SEO Optimization */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2B2622] flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#D98E3F]" />
                <span>Article SEO</span>
              </h2>
              <button
                type="button"
                onClick={autoFillSeo}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] text-[11px] font-bold text-[#1F4D3A] hover:bg-[#F4DFCB]/60"
              >
                <Sparkles className="w-3 h-3 text-[#D98E3F]" />
                <span>Auto-Fill</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1">SEO Title</label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B6560] mb-1">SEO Description</label>
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
