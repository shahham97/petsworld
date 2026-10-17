"use client";

import React, { useState, useTransition } from "react";
import { saveCategoryAction } from "@/actions/category-actions";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useToast } from "@/components/ui/Toast";
import { FieldError } from "@/components/ui/FieldError";
import { InlineAlert } from "@/components/ui/InlineAlert";
import Image from "next/image";
import { X, Loader2, Plus, Edit2, FolderTree } from "lucide-react";

interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  imageAssetId?: string | null;
  sortOrder: number;
  isActive: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

interface Props {
  category?: CategoryData | null;
  parentOptions: { id: string; name: string }[];
  trigger?: React.ReactNode;
}

export function CategoryFormModal({ category, parentOptions, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const toast = useToast();

  const [formData, setFormData] = useState<CategoryData>(
    category || {
      name: "",
      slug: "",
      parentId: null,
      description: "",
      imageAssetId: null,
      sortOrder: 0,
      isActive: true,
      seoTitle: "",
      seoDescription: "",
    }
  );

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.id ? prev.slug : slug, // Only auto-slug for new categories
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await saveCategoryAction(formData);
      if (res.success) {
        toast.success(category?.id ? "Category updated." : "Category created.");
        setIsOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to save category.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Category</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E8D9CD] overflow-hidden">
            <div className="p-6 border-b border-[#E8D9CD] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center text-[#1F4D3A]">
                  <FolderTree className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-[#2B2622]">
                  {category?.id ? "Edit Category" : "Add New Category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-[#6B6560] hover:text-[#2B2622] hover:bg-[#F4DFCB]/40"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMsg && (
                <InlineAlert type="error" title="Cannot Save Category">
                  {errorMsg}
                </InlineAlert>
              )}

              <div>
                <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cat Food"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
                <FieldError error={fieldErrors.name} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    placeholder="cat-food"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm font-mono text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                  />
                  <FieldError error={fieldErrors.slug} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId || ""}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622] bg-white focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {parentOptions
                      .filter((p) => p.id !== category?.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Introductory text displayed on the category landing page..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1.5">
                  Category Image (Database Media Asset)
                </label>
                <div className="flex items-center gap-4">
                  {formData.imageAssetId ? (
                    <div className="relative w-16 h-16 rounded-xl border border-[#E8D9CD] overflow-hidden bg-[#FFF8F0]">
                      <Image
                        src={`/media/${formData.imageAssetId}/thumb`}
                        alt="Category preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageAssetId: null })}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}
                  <MediaPicker
                    buttonLabel={formData.imageAssetId ? "Change Image" : "Select Category Image"}
                    selectedAssetId={formData.imageAssetId}
                    onSelect={(asset) => setFormData({ ...formData, imageAssetId: asset.id })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1F4D3A] focus:ring-[#1F4D3A]"
                  />
                  <label htmlFor="cat-active" className="text-sm font-semibold text-[#2B2622]">
                    Active (visible on storefront)
                  </label>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="pt-2 border-t border-[#E8D9CD] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D98E3F]">
                  SEO & Meta Tags
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6560] mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle || ""}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="e.g. Cat Food in Pakistan | Buy Online | PetsWorld"
                    className="w-full px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B6560] mb-1">
                    SEO Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDescription || ""}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Meta description for search engine result snippets..."
                    className="w-full px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8D9CD]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560] hover:bg-[#F4DFCB]/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{category?.id ? "Update Category" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
