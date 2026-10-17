"use client";

import React, { useState, useTransition } from "react";
import { submitContactMessageAction } from "@/actions/contact-actions";
import { useToast } from "@/components/ui/Toast";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Product Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitContactMessageAction(form);
      if (res.success) {
        setSubmitted(true);
        toast.success("Message sent successfully!");
      } else {
        setErrorMsg(res.error || "Failed to send message.");
      }
    });
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-[#E8D9CD] p-8 sm:p-12 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#2B2622]">Message Received!</h3>
        <p className="text-xs text-[#6B6560] max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out to PetsWorld Pakistan. Our Lahore customer support team has received your note and will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setForm({ name: "", email: "", phone: "", subject: "Product Inquiry", message: "" });
          }}
          className="inline-block px-5 py-2.5 rounded-2xl border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] hover:bg-[#FFF8F0] cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-4 shadow-xs">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
            Your Full Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Usman Tariq"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="usman@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="03001234567"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
            Subject *
          </label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622] bg-white font-medium"
          >
            <option value="Product Inquiry">Product Inquiry</option>
            <option value="Order Status">Order Status</option>
            <option value="Payment or Verification">Payment / Verification</option>
            <option value="Returns & Exchanges">Returns & Exchanges</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
          Message *
        </label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="How can our pet care team help you today?"
          className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
