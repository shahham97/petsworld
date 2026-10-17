import React from "react";
import { db } from "@/lib/db";
import { MessagesList } from "./MessagesList";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight flex items-center gap-2">
          <Mail className="w-7 h-7 text-[#1F4D3A]" />
          <span>Customer Inquiry Inbox</span>
        </h1>
        <p className="text-xs text-[#6B6560] mt-1">
          Messages submitted by visitors through the public Contact page form
        </p>
      </div>

      <MessagesList initialMessages={messages} />
    </div>
  );
}
