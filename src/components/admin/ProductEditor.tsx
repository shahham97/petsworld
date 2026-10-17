"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProductAction } from "@/actions/product-actions";
import { MediaPicker, MediaPickerAsset } from "./MediaPicker";
import { TiptapEditor } from "./TiptapEditor";
import { useToast } from "@/components/ui/Toast";
import { FieldError } from "@/components/ui/FieldError";
import { InlineAlert } from "@/components/ui/InlineAlert";
import Image from "next/image";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Search,
  AlertTriangle,
  HelpCircle,
  Package,
} from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
  parentId?: string | null;
  children?: { id: string; name: string; parentId?: string | null }[];
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice: number | null;
  stockQty: number;
  lowStockThreshold: number;
  isPublished: boolean;
  isFeatured: boolean;
  featuredSort: number;
  weight: string;
  dimensions: string;
  ingredients: string;
  usageInstructions: string;
  hasAllergyNotice: boolean;
  allergyNoticeText: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  categoryIds: string[];
  primaryCategoryId: string;
  specs: { key: string; value: string }[];
  images: { assetId: string; altText: string; sortOrder: number; url?: string }[];
  faqs: { id?: string; question: string; answer: string }[];
}

interface Props {
  initialData?: ProductFormData | null;
  categories: CategoryOption[];
}

export function ProductEditor({ initialData, categories }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState<ProductFormData>(
    initialData || {
      name: "",
      slug: "",
      sku: "",
      brand: "",
      shortDescription: "",
      description: "",
      price: 0,
      salePrice: null,
      stockQty: 10,
      lowStockThreshold: 5,
      isPublished: true,
      isFeatured: false,
      featuredSort: 0,
      weight: "",
      dimensions: "",
      ingredients: "",
      usageInstructions: "",
      hasAllergyNotice: false,
      allergyNoticeText: "",
      seoTitle: "",
      seoDescription: "",
      canonicalUrl: "",
      categoryIds: categories[0] ? [categories[0].id] : [],
      primaryCategoryId: categories[0]?.id || "",
      specs: [
        { key: "Life Stage", value: "Adult" },
        { key: "Country of Origin", value: "Pakistan" },
      ],
      images: [],
      faqs: [],
    }
  );

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.id ? prev.slug : slug,
      sku: prev.id || prev.sku ? prev.sku : `PW-${slug.slice(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    }));
  };

  const autoFillSeo = () => {
    const size = form.weight ? ` ${form.weight}` : "";
    const brand = form.brand ? ` | ${form.brand}` : "";
    const generatedTitle = `${form.name}${size}${brand} | PetsWorld`;
    const generatedDesc = form.shortDescription
      ? form.shortDescription.slice(0, 155)
      : `Buy ${form.name} in Pakistan at PetsWorld. Fast nationwide delivery, cash on delivery, and 100% genuine pet supplies.`;

    setForm((prev) => ({
      ...prev,
      seoTitle: generatedTitle.slice(0, 60),
      seoDescription: generatedDesc.slice(0, 155),
    }));
    toast.info("SEO title and description generated from product fields.");
  };

  const handleAddImage = (asset: MediaPickerAsset) => {
    setForm((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          assetId: asset.id,
          altText: asset.altText || prev.name,
          sortOrder: prev.images.length,
          url: asset.thumbUrl,
        },
      ],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    setForm((prev) => {
      const copy = [...prev.images];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return { ...prev, images: copy };
    });
  };

  const parentCategories = categories.filter((c) => !c.parentId);
  const currentPrimaryCat = categories.find((c) => c.id === form.primaryCategoryId);
  const selectedParentId = currentPrimaryCat?.parentId || form.primaryCategoryId || parentCategories[0]?.id || "";

  const handleSelectMainCategory = (parentId: string) => {
    setForm((prev) => {
      // Keep subcategories belonging to this new parent, and ensure new parent is added
      const newCategoryIds = prev.categoryIds.filter((cid) => {
        const catObj = categories.find((c) => c.id === cid);
        return catObj?.parentId === parentId || cid === parentId;
      });
      if (!newCategoryIds.includes(parentId)) {
        newCategoryIds.push(parentId);
      }
      return {
        ...prev,
        primaryCategoryId: parentId,
        categoryIds: newCategoryIds,
      };
    });
  };

  const handleCategoryToggle = (id: string) => {
    setForm((prev) => {
      const exists = prev.categoryIds.includes(id);
      let newCats = exists ? prev.categoryIds.filter((c) => c !== id) : [...prev.categoryIds, id];
      if (newCats.length === 0) newCats = [id]; // keep at least one
      const newPrimary = newCats.includes(prev.primaryCategoryId)
        ? prev.primaryCategoryId
        : newCats[0];
      return { ...prev, categoryIds: newCats, primaryCategoryId: newPrimary };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await saveProductAction(form);
      if (res.success) {
        toast.success(form.id ? "Product updated successfully." : "Product created successfully.");
        router.push("/admin/products");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to save product.");
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  };

  const titleLength = form.seoTitle.length;
  const descLength = form.seoDescription.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Bar with Title and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            {form.id ? `Edit: ${form.name}` : "Create New Product"}
          </h1>
          <p className="text-xs text-[#6B6560] mt-1">
            Product template renders live at <code>/product/{form.slug || "[slug]"}</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-4 py-2.5 rounded-2xl border border-[#E8D9CD] bg-white text-xs font-bold text-[#6B6560] hover:bg-[#F4DFCB]/40 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{form.id ? "Update Product" : "Publish Product"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <InlineAlert type="error" title="Validation Failed">
          {errorMsg}
        </InlineAlert>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Content and Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1F4D3A]" />
              <span>General Information</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Canin Kitten Dry Food 2kg"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
              />
              <FieldError error={fieldErrors.name} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm font-mono text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
                <FieldError error={fieldErrors.slug} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm font-mono text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
                <FieldError error={fieldErrors.sku} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g. Royal Canin, Pure Paws"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Weight / Size
                </label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g. 2 kg, 400 g, Large"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Short Description (Card & Header Excerpt)
              </label>
              <textarea
                rows={2}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="A concise summary of key benefits..."
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Full Description (Rich Text) *
              </label>
              <TiptapEditor
                content={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
              />
              <FieldError error={fieldErrors.description} />
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622]">Pricing & Inventory (PKR)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Regular Price (PKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  placeholder="2500"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm font-semibold text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
                <FieldError error={fieldErrors.price} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Sale Price (Optional PKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.salePrice ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salePrice: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Leave empty if not on sale"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm font-semibold text-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
                <FieldError error={fieldErrors.salePrice} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Stock Quantity in Warehouse *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.stockQty}
                  onChange={(e) => setForm({ ...form, stockQty: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm font-semibold text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
                <FieldError error={fieldErrors.stockQty} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setForm({ ...form, lowStockThreshold: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#2B2622]">Product Specifications</h2>
                <p className="text-xs text-[#6B6560]">
                  Key-value attributes rendered on the product page
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, specs: [...form.specs, { key: "", value: "" }] })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] hover:bg-[#F4DFCB]/50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {form.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    placeholder="e.g. Flavour, Breed Size"
                    onChange={(e) => {
                      const copy = [...form.specs];
                      copy[i].key = e.target.value;
                      setForm({ ...form, specs: copy });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    placeholder="e.g. Chicken, Small & Medium"
                    onChange={(e) => {
                      const copy = [...form.specs];
                      copy[i].value = e.target.value;
                      setForm({ ...form, specs: copy });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, specs: form.specs.filter((_, idx) => idx !== i) })
                    }
                    className="p-2 text-[#991B1B] hover:bg-[#FEE2E2] rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Allergy Notice & Ingredients Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622]">Allergy, Ingredients & Usage</h2>

            {/* Allergy Toggle */}
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#92400E]">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <span>Has Allergy / Safety Notice?</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.hasAllergyNotice}
                  onChange={(e) => setForm({ ...form, hasAllergyNotice: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D98E3F] focus:ring-[#D98E3F]"
                />
              </div>

              {form.hasAllergyNotice && (
                <div>
                  <label className="block text-xs font-bold text-[#92400E] mb-1">
                    Verified Allergy Notice Text *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.allergyNoticeText}
                    onChange={(e) => setForm({ ...form, allergyNoticeText: e.target.value })}
                    placeholder="e.g. Contains poultry by-products and wheat gluten. Not recommended for pets with known chicken sensitivities."
                    className="w-full px-4 py-2 rounded-xl border border-[#FDE68A] bg-white text-xs text-[#2B2622] focus:ring-2 focus:ring-[#D98E3F] focus:outline-none"
                  />
                  <FieldError error={fieldErrors.allergyNoticeText} />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Ingredients & Composition
              </label>
              <textarea
                rows={2}
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                placeholder="Dehydrated poultry protein, rice, vegetable protein isolate, animal fats..."
                className="w-full px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Usage / Feeding Guidelines
              </label>
              <textarea
                rows={2}
                value={form.usageInstructions}
                onChange={(e) => setForm({ ...form, usageInstructions: e.target.value })}
                placeholder="Feed 50g-70g per day depending on cat weight. Provide fresh drinking water at all times."
                className="w-full px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Categories, Visibility, Images, SEO */}
        <div className="space-y-6">
          {/* Status & Visibility Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622]">Visibility & Promotion</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1F4D3A] focus:ring-[#1F4D3A]"
                />
                <div>
                  <span className="text-xs font-bold text-[#2B2622] block">Published</span>
                  <span className="text-[11px] text-[#6B6560]">Live on public catalog</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-[#D98E3F] focus:ring-[#D98E3F]"
                />
                <div>
                  <span className="text-xs font-bold text-[#2B2622] block">Featured on Homepage</span>
                  <span className="text-[11px] text-[#6B6560]">Included in homepage slider</span>
                </div>
              </label>

              {form.isFeatured && (
                <div>
                  <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                    Featured Slider Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.featuredSort}
                    onChange={(e) => setForm({ ...form, featuredSort: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Categories & Subcategories Assignment */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#2B2622]">Category & Subcategory Selection *</h2>
              <p className="text-xs text-[#6B6560] mt-0.5">
                Select the main category, then pick any relevant subcategories for this product.
              </p>
            </div>

            {/* 1. Main Category Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1.5">
                Main Category *
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => handleSelectMainCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm font-semibold text-[#2B2622] bg-white focus:ring-2 focus:ring-[#1F4D3A] focus:outline-none"
              >
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Subcategories Selection (if available) */}
            {(() => {
              const currentParent = categories.find((c) => c.id === selectedParentId);
              const subcategories = categories.filter((c) => c.parentId === selectedParentId);
              if (subcategories.length === 0) {
                return (
                  <div className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD]/70 text-xs text-[#6B6560]">
                    No subcategories found for <strong>{currentParent?.name || "this category"}</strong>. The product will be assigned directly to {currentParent?.name}.
                  </div>
                );
              }
              return (
                <div className="bg-[#FFF8F0]/70 p-4 rounded-2xl border border-[#E8D9CD] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F4D3A] uppercase tracking-wide">
                      Subcategories ({currentParent?.name})
                    </span>
                    <span className="text-[11px] text-[#6B6560]">Select all that apply</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {subcategories.map((sub) => {
                      const isChecked = form.categoryIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-white border-[#1F4D3A] text-[#1F4D3A] font-bold shadow-xs"
                              : "bg-white/80 border-[#E8D9CD] text-[#2B2622] hover:border-[#1F4D3A]/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(sub.id)}
                            className="w-4 h-4 rounded text-[#1F4D3A] focus:ring-[#1F4D3A]"
                          />
                          <span className="truncate">{sub.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Selected Categories Summary Badges */}
            <div className="pt-2 border-t border-[#E8D9CD]/60">
              <span className="text-xs font-bold text-[#6B6560] block mb-2">
                Active Assignments ({form.categoryIds.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {form.categoryIds.map((cid) => {
                  const cat = categories.find((c) => c.id === cid);
                  if (!cat) return null;
                  const isPrimary = cid === form.primaryCategoryId;
                  return (
                    <span
                      key={cid}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isPrimary
                          ? "bg-[#1F4D3A] text-white shadow-xs"
                          : "bg-white border border-[#E8D9CD] text-[#2B2622]"
                      }`}
                    >
                      {cat.name}
                      {isPrimary && <span className="text-[10px] text-[#D98E3F] font-bold">★ Primary</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            <FieldError error={fieldErrors.categoryIds} />
          </div>

          {/* Images Gallery */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#2B2622]">Product Images</h2>
                <p className="text-xs text-[#6B6560]">First image serves as main product display</p>
              </div>
              <MediaPicker
                buttonLabel="Add Image"
                onSelect={handleAddImage}
              />
            </div>

            <div className="space-y-3">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD]"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-white border border-[#E8D9CD] overflow-hidden shrink-0">
                    <Image
                      src={img.url || `/media/${img.assetId}/thumb`}
                      alt={img.altText}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={img.altText}
                      placeholder="Image alt text"
                      onChange={(e) => {
                        const copy = [...form.images];
                        copy[i].altText = e.target.value;
                        setForm({ ...form, images: copy });
                      }}
                      className="w-full px-2 py-1 text-xs rounded-lg border border-[#E8D9CD] bg-white truncate"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveImage(i, "up")}
                      disabled={i === 0}
                      className="p-1 text-[#6B6560] hover:text-[#1F4D3A] disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveImage(i, "down")}
                      disabled={i === form.images.length - 1}
                      className="p-1 text-[#6B6560] hover:text-[#1F4D3A] disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="p-1 text-[#991B1B] hover:text-[#DC2626]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Optimization Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2B2622] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#D98E3F]" />
                <span>SEO & SERP Preview</span>
              </h2>
              <button
                type="button"
                onClick={autoFillSeo}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] text-[11px] font-bold text-[#1F4D3A] hover:bg-[#F4DFCB]/60"
              >
                <Sparkles className="w-3 h-3 text-[#D98E3F]" />
                <span>Auto-Fill SEO</span>
              </button>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8D9CD] text-xs space-y-1">
              <div className="text-[11px] text-[#202124] truncate">
                petsworld.pk › product › {form.slug || "example-product"}
              </div>
              <div className="text-sm font-medium text-[#1A0DAB] hover:underline cursor-pointer truncate">
                {form.seoTitle || `${form.name || "Product Name"} | PetsWorld`}
              </div>
              <div className="text-xs text-[#4D5156] line-clamp-2">
                {form.seoDescription || form.shortDescription || "Shop pet supplies online in Pakistan at PetsWorld.pk."}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <label className="text-[#6B6560]">SEO Title</label>
                <span className={`text-[10px] font-mono ${titleLength > 60 ? "text-[#DC2626]" : titleLength >= 45 ? "text-[#16A34A]" : "text-[#D98E3F]"}`}>
                  {titleLength} / 60
                </span>
              </div>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                placeholder="Product Name | Brand | PetsWorld"
                className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <label className="text-[#6B6560]">SEO Meta Description</label>
                <span className={`text-[10px] font-mono ${descLength > 155 ? "text-[#DC2626]" : descLength >= 120 ? "text-[#16A34A]" : "text-[#D98E3F]"}`}>
                  {descLength} / 155
                </span>
              </div>
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                placeholder="Buy this pet food in Pakistan at PetsWorld..."
                className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
