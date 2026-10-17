"use client";

import React, { useState, useTransition } from "react";
import { Mail, Trash2, CheckCircle, Clock } from "lucide-react";
import { markContactMessageReadAction, deleteContactMessageAction } from "@/actions/contact-actions";
import { useToast } from "@/components/ui/Toast";

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: Date | string;
}

export function MessagesList({ initialMessages }: { initialMessages: ContactMessageItem[] }) {
  const [messages, setMessages] = useState<ContactMessageItem[]>(initialMessages);
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const toast = useToast();

  const handleMarkRead = (id: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const res = await markContactMessageReadAction(id);
      if (res.success) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "READ" } : m)));
        toast.success("Message marked as read.");
      } else {
        toast.error("Failed to update message.");
      }
      setProcessingId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    setProcessingId(id);
    startTransition(async () => {
      const res = await deleteContactMessageAction(id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        toast.success("Message deleted.");
      } else {
        toast.error("Failed to delete message.");
      }
      setProcessingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-12 text-center text-[#6B6560]">
          <Mail className="w-8 h-8 text-[#6B6560]/40 mx-auto mb-2" />
          Your inbox is completely clear. No customer inquiries pending.
        </div>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={`bg-white rounded-3xl border p-5 sm:p-6 space-y-3 shadow-xs transition-all ${
              m.status === "UNREAD" ? "border-[#1F4D3A] bg-[#FFF8F0]/30" : "border-[#E8D9CD]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8D9CD]/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#2B2622]">{m.name}</span>
                  {m.status === "UNREAD" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1F4D3A] text-white">
                      NEW
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#6B6560]">
                  {m.email} {m.phone && `• ${m.phone}`}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#6B6560]">
                <Clock className="w-3.5 h-3.5 text-[#D98E3F]" />
                <span>
                  {new Date(m.createdAt).toLocaleDateString("en-PK", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D98E3F] block mb-1">
                Subject: {m.subject}
              </span>
              <p className="text-xs text-[#2B2622] leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </div>

            <div className="pt-2 border-t border-[#E8D9CD]/50 flex items-center justify-between gap-2">
              <div>
                {m.status === "UNREAD" && (
                  <button
                    type="button"
                    disabled={isPending && processingId === m.id}
                    onClick={() => handleMarkRead(m.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark as Read</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={isPending && processingId === m.id}
                onClick={() => handleDelete(m.id)}
                className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
