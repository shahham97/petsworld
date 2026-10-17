"use client";

import React from "react";

export interface WhatsAppSettingsProps {
  whatsAppEnabled?: boolean;
  whatsAppNumber?: string | null;
  whatsAppPrefilledMessage?: string | null;
  whatsAppButtonLabel?: string | null;
  whatsAppButtonSide?: string | null;
}

export function WhatsAppWidget({ settings }: { settings?: WhatsAppSettingsProps | null }) {
  const isEnabled = settings?.whatsAppEnabled ?? true;
  const rawNumber = settings?.whatsAppNumber || "923001234567";

  if (!isEnabled) {
    return null;
  }

  const cleanNumber = rawNumber.replace(/\D/g, "");
  if (cleanNumber.length < 10) return null;

  const prefilled =
    settings?.whatsAppPrefilledMessage ||
    "Hi PetsWorld, I have a question about your pet supplies.";
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilled)}`;
  const sideClass = settings?.whatsAppButtonSide === "left" ? "left-5" : "right-5";
  const label = settings?.whatsAppButtonLabel || "WhatsApp";

  return (
    <aside aria-label="Direct WhatsApp Support">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with PetsWorld on WhatsApp (${label})`}
        className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 ${sideClass} z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-xl shadow-[#25D366]/35 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 select-none group leading-none`}
      >
        {/* Official WhatsApp Vector Glyph */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.97.57 3.81 1.554 5.372L2.2 22l4.793-1.325a9.97 9.97 0 0 0 5.038 1.357c5.536 0 10.031-4.495 10.031-10.031C22.062 6.495 17.567 2 12.031 2Zm5.79 14.28c-.244.685-1.42 1.258-1.95 1.299-.508.038-1.166.07-3.418-.838-2.693-1.087-4.437-3.83-4.571-4.009-.134-.179-1.09-1.45-1.09-2.766 0-1.316.69-1.96 1.01-2.228.24-.2.53-.25.71-.25.179 0 .357.009.513.018.165.009.387-.063.606.463.227.545.776 1.892.845 2.031.069.14.116.304.023.49-.092.188-.138.305-.275.467-.138.16-.29.359-.414.482-.138.138-.282.289-.121.566.16.276.714 1.178 1.533 1.908 1.054.938 1.942 1.228 2.218 1.366.276.138.437.116.598-.07.161-.186.689-.803.873-1.079.184-.276.368-.23.62-.138.253.092 1.607.757 1.883.895.276.138.46.207.528.322.069.115.069.667-.175 1.352Z"
            />
          </svg>
        </div>

        <span className="hidden min-[360px]:inline-block tracking-wide leading-none font-semibold text-sm">
          {label}
        </span>
      </a>
    </aside>
  );
}
