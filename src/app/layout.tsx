import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/lib/cart-context";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { getCachedStoreSettings } from "@/lib/cached-data";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#FAF5EE",
};

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PetsWorld.pk | Pet Food & Accessories in Pakistan",
  description:
    "Shop cat food, dog food, bird supplies and pet accessories online in Pakistan. Cash on Delivery, Easypaisa & JazzCash. Fast delivery nationwide.",
  icons: {
    icon: "/images/favicon.png",
  },
};

import { Suspense } from "react";
import { PageNavigationLoader } from "@/components/ui/PageNavigationLoader";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getCachedStoreSettings();

  return (
    <html lang="en" suppressHydrationWarning className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body suppressHydrationWarning className="flex flex-col min-h-screen bg-[#FFF8F0] text-[#2B2622]">
        <Suspense fallback={null}>
          <PageNavigationLoader />
        </Suspense>
        <ToastProvider>
          <CartProvider>
            <StorefrontShell settings={settings}>
              {children}
            </StorefrontShell>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
