"use client";

import React, { useState, useTransition } from "react";
import { saveEmailSettingsAction, sendTestEmailAction } from "@/actions/settings-actions";
import { useToast } from "@/components/ui/Toast";
import { Save, Loader2, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";

export function EmailPanel({
  settings,
  isResendConfigured,
}: {
  settings: any;
  isResendConfigured: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTestTransition] = useTransition();
  const [testEmail, setTestEmail] = useState("");
  const toast = useToast();

  const [form, setForm] = useState({
    emailEnabled: settings?.emailEnabled ?? true,
    emailFromName: settings?.emailFromName || "PetsWorld",
    emailReplyTo: settings?.emailReplyTo || "orders@petsworld.pk",
    emailNotificationToggles: settings?.emailNotificationToggles || {
      orderReceived: true,
      paymentVerified: true,
      paymentRejected: true,
      processing: true,
      shipped: true,
      delivered: true,
      cancelled: true,
    },
  });

  const handleToggle = (key: string) => {
    setForm((prev) => ({
      ...prev,
      emailNotificationToggles: {
        ...prev.emailNotificationToggles,
        [key]: !prev.emailNotificationToggles[key],
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveEmailSettingsAction(form);
      if (res.success) {
        toast.success("Email notification preferences saved.");
      } else {
        toast.error(res.error || "Failed to save settings.");
      }
    });
  };

  const handleSendTest = () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid recipient email for the test.");
      return;
    }

    startTestTransition(async () => {
      const res = await sendTestEmailAction(testEmail);
      if (res.success) {
        toast.success(`Test email sent to ${testEmail}! Check your inbox.`);
      } else {
        toast.error(res.error || "Failed to send test email.");
      }
    });
  };

  const notificationLabels: Record<string, string> = {
    orderReceived: "Order Received (COD or awaiting payment proof)",
    paymentVerified: "Payment Verified & Order Confirmed",
    paymentRejected: "Payment Rejected (needs re-submission)",
    processing: "Order Processing in Warehouse",
    shipped: "Order Shipped (with courier tracking number)",
    delivered: "Order Delivered Confirmation",
    cancelled: "Order Cancelled (stock restored)",
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h2 className="text-base font-bold text-[#2B2622]">Transactional Email Notifications (Resend)</h2>
          <p className="text-xs text-[#6B6560]">Automated customer alerts triggered upon order and payment status changes</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Resend Integration Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        isResendConfigured
          ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
          : "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
      }`}>
        <div className="flex items-center gap-3">
          {isResendConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0" />
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">
              Resend Status: {isResendConfigured ? "Configured & Ready" : "Not Configured Yet"}
            </span>
            <span className="text-xs">
              {isResendConfigured
                ? "API key detected. Transactional emails will be delivered automatically."
                : "RESEND_API_KEY is not set. All email attempts are safely logged as SKIPPED_NOT_CONFIGURED in the database without throwing."}
            </span>
          </div>
        </div>
      </div>

      {/* General Email Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Sender Display Name
          </label>
          <input
            type="text"
            value={form.emailFromName}
            onChange={(e) => setForm({ ...form, emailFromName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Reply-To Address
          </label>
          <input
            type="email"
            value={form.emailReplyTo}
            onChange={(e) => setForm({ ...form, emailReplyTo: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="email-master"
            checked={form.emailEnabled}
            onChange={(e) => setForm({ ...form, emailEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-[#1F4D3A]"
          />
          <label htmlFor="email-master" className="text-sm font-bold text-[#2B2622]">
            Master Email Switch (Enable Outgoing)
          </label>
        </div>
      </div>

      {/* Per Notification Type Toggles */}
      <div className="pt-4 border-t border-[#E8D9CD] space-y-3">
        <label className="text-xs font-bold uppercase text-[#2B2622] block">
          Trigger Notifications On Lifecycle Events
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(form.emailNotificationToggles).map((key) => {
            const isChecked = form.emailNotificationToggles[key];
            return (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] cursor-pointer hover:bg-[#F4DFCB]/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(key)}
                  className="w-4 h-4 rounded text-[#1F4D3A]"
                />
                <span className="text-xs font-semibold text-[#2B2622]">
                  {notificationLabels[key] || key}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Send Test Email Widget */}
      <div className="pt-4 border-t border-[#E8D9CD] space-y-3">
        <label className="text-xs font-bold uppercase text-[#2B2622] block">
          Send Test Email
        </label>

        <div className="flex gap-2 max-w-md">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={!isResendConfigured}
            placeholder={isResendConfigured ? "recipient@example.com" : "Configure RESEND_API_KEY first"}
            className="flex-1 px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622] disabled:bg-[#F3F4F6] disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleSendTest}
            disabled={!isResendConfigured || isTesting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send Test</span>
          </button>
        </div>
        <p className="text-[11px] text-[#6B6560]">
          Once domain is verified in Resend, use this button to confirm delivery.
        </p>
      </div>
    </div>
  );
}
