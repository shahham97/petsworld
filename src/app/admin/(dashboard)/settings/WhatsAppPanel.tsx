"use client";

import React, { useState, useTransition } from "react";
import { saveWhatsAppSettingsAction } from "@/actions/settings-actions";
import { useToast } from "@/components/ui/Toast";
import { Save, Loader2, MessageCircle } from "lucide-react";

export function WhatsAppPanel({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const [enabled, setEnabled] = useState<boolean>(settings?.whatsAppEnabled ?? true);
  const [number, setNumber] = useState<string>(settings?.whatsAppNumber || "923001234567");
  const [message, setMessage] = useState<string>(
    settings?.whatsAppPrefilledMessage || "Hi PetsWorld, I have a question about your pet supplies."
  );
  const [label, setLabel] = useState<string>(settings?.whatsAppButtonLabel || "WhatsApp");
  const [side, setSide] = useState<string>(settings?.whatsAppButtonSide || "right");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveWhatsAppSettingsAction({
        whatsAppEnabled: enabled,
        whatsAppNumber: number,
        whatsAppPrefilledMessage: message,
        whatsAppButtonLabel: label,
        whatsAppButtonSide: side,
      });

      if (res.success) {
        toast.success("WhatsApp widget settings saved successfully.");
      } else {
        toast.error(res.error || "Failed to save settings.");
      }
    });
  };

  // Preview wa.me URL
  const previewUrl = `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h2 className="text-base font-bold text-[#2B2622]">WhatsApp Floating Widget Settings</h2>
          <p className="text-xs text-[#6B6560]">Configure the fixed customer support button displayed across the storefront</p>
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

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD]">
        <input
          type="checkbox"
          id="wa-enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-5 h-5 rounded text-[#25D366] focus:ring-[#25D366]"
        />
        <div>
          <label htmlFor="wa-enabled" className="text-sm font-bold text-[#2B2622] block">
            Show WhatsApp Widget Site-Wide
          </label>
          <span className="text-xs text-[#6B6560]">
            When disabled or empty, nothing renders on the public site and zero layout shift occurs.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            WhatsApp Phone Number *
          </label>
          <input
            type="text"
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="03001234567 or 923001234567"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm font-mono text-[#2B2622]"
          />
          <span className="text-[11px] text-[#6B6560] mt-1 block">
            Pakistani format (03XXXXXXXXX) is automatically converted to international standard.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Button Label Text
          </label>
          <input
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Pre-Filled Customer Message
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Screen Position
          </label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622] bg-white"
          >
            <option value="right">Bottom Right (Default)</option>
            <option value="left">Bottom Left</option>
          </select>
        </div>
      </div>

      {/* Live Widget Preview */}
      <div className="pt-4 border-t border-[#E8D9CD]">
        <span className="text-xs font-bold uppercase text-[#6B6560] block mb-3">
          Live Button Appearance Preview
        </span>

        <div className="p-6 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex flex-col items-center justify-center gap-3">
          {enabled ? (
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-sm shadow-lg shadow-[#25D366]/30">
              {/* WhatsApp Official SVG Logo */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.201.3-.777.978-.952 1.179-.176.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.175-.3-.019-.462.132-.612.136-.135.301-.35.452-.526.15-.175.201-.3.301-.5.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.233-.244-.585-.493-.506-.677-.515-.175-.01-.376-.01-.577-.01-.2 0-.527.075-.802.375-.276.3-1.053 1.029-1.053 2.509 0 1.48 1.079 2.909 1.229 3.109.15.2 2.122 3.24 5.14 4.542.718.31 1.279.495 1.716.634.721.229 1.377.197 1.896.12.577-.087 1.78-.727 2.031-1.429.251-.702.251-1.303.176-1.429-.076-.125-.276-.2-.577-.35zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.307A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
              <span>{label}</span>
            </div>
          ) : (
            <span className="text-xs text-[#6B6560] italic">Widget is currently hidden</span>
          )}

          <p className="text-[11px] font-mono text-[#6B6560] truncate max-w-md">
            Target URL: {previewUrl}
          </p>
        </div>
      </div>
    </form>
  );
}
