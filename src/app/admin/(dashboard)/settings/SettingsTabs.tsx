"use client";

import React, { useState } from "react";
import { Store, Truck, CreditCard, MessageCircle, Mail } from "lucide-react";
import { GeneralPanel } from "./GeneralPanel";
import { ShippingPanel } from "./ShippingPanel";
import { PaymentMethodsPanel } from "./PaymentMethodsPanel";
import { WhatsAppPanel } from "./WhatsAppPanel";
import { EmailPanel } from "./EmailPanel";

interface Props {
  settings: any;
  paymentMethods: any[];
  isResendConfigured: boolean;
}

export function SettingsTabs({ settings, paymentMethods, isResendConfigured }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "shipping" | "payments" | "whatsapp" | "email">("general");

  const tabs = [
    { key: "general", label: "General", icon: Store },
    { key: "shipping", label: "Shipping & Cities", icon: Truck },
    { key: "payments", label: "Payment Methods", icon: CreditCard },
    { key: "whatsapp", label: "WhatsApp Widget", icon: MessageCircle },
    { key: "email", label: "Email Notifications", icon: Mail },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white border border-[#E8D9CD]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1F4D3A] text-white shadow-sm"
                  : "text-[#6B6560] hover:text-[#2B2622] hover:bg-[#FFF8F0]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "general" && <GeneralPanel settings={settings} />}
        {activeTab === "shipping" && <ShippingPanel settings={settings} />}
        {activeTab === "payments" && <PaymentMethodsPanel paymentMethods={paymentMethods} />}
        {activeTab === "whatsapp" && <WhatsAppPanel settings={settings} />}
        {activeTab === "email" && (
          <EmailPanel settings={settings} isResendConfigured={isResendConfigured} />
        )}
      </div>
    </div>
  );
}
