"use client";

import React, { useState, useTransition } from "react";
import { saveGeneralSettingsAction } from "@/actions/settings-actions";
import { useToast } from "@/components/ui/Toast";
import { Save, Loader2 } from "lucide-react";

export function GeneralPanel({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const [form, setForm] = useState({
    storeName: settings?.storeName || "PetsWorld",
    phone: settings?.phone || "03001234567",
    email: settings?.email || "info@petsworld.pk",
    address: settings?.address || "DHA Phase 5, Lahore, Pakistan",
    announcementBarText: settings?.announcementBarText || "",
    announcementBarEnabled: settings?.announcementBarEnabled ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveGeneralSettingsAction(form);
      if (res.success) {
        toast.success("General settings saved successfully.");
      } else {
        toast.error(res.error || "Failed to save settings.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8D9CD]">
        <div>
          <h2 className="text-base font-bold text-[#2B2622]">Store Information & Announcement</h2>
          <p className="text-xs text-[#6B6560]">Public contact numbers, support email, and header announcement banner</p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Store Name
          </label>
          <input
            type="text"
            required
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Support Helpline Phone
          </label>
          <input
            type="text"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Support Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Office / Hub Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="pt-4 border-t border-[#E8D9CD] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase text-[#2B2622] block">
            Top Announcement Bar
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ann-enabled"
              checked={form.announcementBarEnabled}
              onChange={(e) => setForm({ ...form, announcementBarEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-[#1F4D3A]"
            />
            <label htmlFor="ann-enabled" className="text-xs font-semibold text-[#2B2622]">
              Enable Banner
            </label>
          </div>
        </div>

        <input
          type="text"
          value={form.announcementBarText}
          onChange={(e) => setForm({ ...form, announcementBarText: e.target.value })}
          placeholder="e.g. 🐾 Free delivery across Pakistan on orders over Rs. 3,000!"
          className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
        />
      </div>
    </form>
  );
}
