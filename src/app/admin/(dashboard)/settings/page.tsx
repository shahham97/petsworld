import React from "react";
import { db } from "@/lib/db";
import { SettingsTabs } from "./SettingsTabs";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, paymentMethods] = await Promise.all([
    db.storeSettings.findUnique({
      where: { id: "default" },
    }),
    db.paymentMethod.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const isResendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-[#E8D9CD]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
          Store Settings
        </h1>
        <p className="text-sm text-[#6B6560] mt-1">
          Configure store identity, delivery coverage, payment verification accounts, WhatsApp, and email alerts
        </p>
      </div>

      <SettingsTabs
        settings={settings}
        paymentMethods={paymentMethods}
        isResendConfigured={isResendConfigured}
      />
    </div>
  );
}
