"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppWidget } from "./WhatsAppWidget";
import { CartDrawer } from "@/components/cart/CartDrawer";

export interface StorefrontShellProps {
  children: React.ReactNode;
  settings?: {
    announcementBarText?: string | null;
    announcementBarEnabled?: boolean;
    whatsAppEnabled?: boolean;
    whatsAppNumber?: string | null;
    whatsAppPrefilledMessage?: string | null;
    whatsAppButtonLabel?: string | null;
    whatsAppButtonSide?: string | null;
  } | null;
}

export function StorefrontShell({ children, settings }: StorefrontShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        announcementText={settings?.announcementBarText}
        announcementEnabled={settings?.announcementBarEnabled}
      />
      <div className="flex-1">{children}</div>
      <Footer />
      <WhatsAppWidget settings={settings} />
      <CartDrawer />
    </div>
  );
}
