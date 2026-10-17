"use client";

import React, { useState, useTransition } from "react";
import { saveHeroSettingsAction } from "@/actions/hero-actions";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import { Save, Loader2, Type, X, Plus, Trash2 } from "lucide-react";

export function HeroEditorForm({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const [form, setForm] = useState({
    heroHeadline: settings?.heroHeadline || "Everything They Love. All in One Place.",
    heroSubheadline: settings?.heroSubheadline || "Premium Pet Food • Accessories • Care",
    heroPrimaryCtaLabel: settings?.heroPrimaryCtaLabel || "Shop Now",
    heroPrimaryCtaLink: settings?.heroPrimaryCtaLink || "/shop",
    heroSecondaryCtaLabel: settings?.heroSecondaryCtaLabel || "Browse Categories",
    heroSecondaryCtaLink: settings?.heroSecondaryCtaLink || "/categories",
    heroAssetId: settings?.heroAssetId || null,
    heroMobileAssetId: settings?.heroMobileAssetId || null,
    whyPetsWorldPoints: Array.isArray(settings?.whyPetsWorldPoints)
      ? settings.whyPetsWorldPoints
      : [
          { title: "100% Authentic Products", description: "Directly from authorized brands", icon: "ShieldCheck" },
          { title: "Nationwide Express Delivery", description: "Safe doorstep delivery across Pakistan", icon: "Truck" },
          { title: "Flexible Payment Options", description: "COD, Easypaisa, JazzCash, or Bank", icon: "CreditCard" },
          { title: "Dedicated Pet Support", description: "WhatsApp helpline available daily", icon: "HeartHandshake" },
        ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveHeroSettingsAction(form);
      if (res.success) {
        toast.success("Homepage content updated. Live on storefront within seconds.");
      } else {
        toast.error(res.error || "Failed to update homepage content.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            Homepage & Hero Content Editor
          </h1>
          <p className="text-sm text-[#6B6560] mt-1">
            Edit headlines, CTAs, hero background image, and trust points with instant live revalidation
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Homepage Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Texts & CTAs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622] flex items-center gap-2">
              <Type className="w-4 h-4 text-[#D98E3F]" />
              <span>Hero Text & Call-to-Actions</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Main Headline *
              </label>
              <input
                type="text"
                required
                value={form.heroHeadline}
                onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                placeholder="Everything They Love. All in One Place."
                className="w-full px-4 py-3 rounded-2xl border border-[#E8D9CD] text-lg font-bold text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                Sub-Headline
              </label>
              <input
                type="text"
                value={form.heroSubheadline}
                onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
                placeholder="Premium Pet Food • Accessories • Care"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-sm text-[#2B2622] focus:ring-2 focus:ring-[#1F4D3A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Primary CTA Label
                </label>
                <input
                  type="text"
                  required
                  value={form.heroPrimaryCtaLabel}
                  onChange={(e) => setForm({ ...form, heroPrimaryCtaLabel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Primary CTA Link
                </label>
                <input
                  type="text"
                  required
                  value={form.heroPrimaryCtaLink}
                  onChange={(e) => setForm({ ...form, heroPrimaryCtaLink: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm font-mono text-[#2B2622]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Secondary CTA Label
                </label>
                <input
                  type="text"
                  required
                  value={form.heroSecondaryCtaLabel}
                  onChange={(e) => setForm({ ...form, heroSecondaryCtaLabel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Secondary CTA Link
                </label>
                <input
                  type="text"
                  required
                  value={form.heroSecondaryCtaLink}
                  onChange={(e) => setForm({ ...form, heroSecondaryCtaLink: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm font-mono text-[#2B2622]"
                />
              </div>
            </div>
          </div>

          {/* Why PetsWorld Trust Points */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#2B2622]">Why PetsWorld Trust Points</h2>
                <p className="text-xs text-[#6B6560]">Highlights rendered in the trust section on the home page</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    whyPetsWorldPoints: [
                      ...form.whyPetsWorldPoints,
                      { title: "New Feature", description: "Details...", icon: "ShieldCheck" },
                    ],
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Point</span>
              </button>
            </div>

            <div className="space-y-3">
              {form.whyPetsWorldPoints.map((pt: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD]">
                  <input
                    type="text"
                    value={pt.title}
                    placeholder="Title"
                    onChange={(e) => {
                      const copy = [...form.whyPetsWorldPoints];
                      copy[i].title = e.target.value;
                      setForm({ ...form, whyPetsWorldPoints: copy });
                    }}
                    className="w-1/3 px-3 py-2 rounded-xl border border-[#E8D9CD] bg-white text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={pt.description}
                    placeholder="Short description"
                    onChange={(e) => {
                      const copy = [...form.whyPetsWorldPoints];
                      copy[i].description = e.target.value;
                      setForm({ ...form, whyPetsWorldPoints: copy });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8D9CD] bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        whyPetsWorldPoints: form.whyPetsWorldPoints.filter((_: any, idx: number) => idx !== i),
                      })
                    }
                    className="p-2 text-[#991B1B] hover:bg-[#FEE2E2] rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Hero Image Asset */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#2B2622]">Hero Photography (LCP)</h2>
            <p className="text-xs text-[#6B6560]">
              Stored directly in the database media pipeline. Served as WebP with priority loading.
            </p>

            <div className="relative aspect-[724/576] rounded-2xl overflow-hidden border-2 border-[#E8D9CD] bg-[#FFF8F0]">
              {form.heroAssetId ? (
                <Image
                  src={`/media/${form.heroAssetId}/md`}
                  alt="Hero preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#6B6560]">
                  <span className="text-xs">No image set. Tasteful gradient will render automatically.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <MediaPicker
                buttonLabel={form.heroAssetId ? "Replace Hero Image" : "Upload Hero Image"}
                selectedAssetId={form.heroAssetId}
                onSelect={(asset) => setForm({ ...form, heroAssetId: asset.id })}
              />

              {form.heroAssetId && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, heroAssetId: null })}
                  className="px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs font-bold text-[#991B1B] hover:bg-[#FEE2E2]"
                >
                  Clear Image
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
