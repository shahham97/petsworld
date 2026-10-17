"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageNavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showCenterLoader, setShowCenterLoader] = useState(false);

  // Reset loading indicators on route completion
  useEffect(() => {
    setIsNavigating(false);
    setShowCenterLoader(false);
  }, [pathname, searchParams]);

  // Intercept click on internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Only handle internal navigation
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !targetAttr &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // Only trigger if destination is different from current URL
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        if (href !== currentUrl) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  // Show center loader only if navigation lag exceeds 200ms
  useEffect(() => {
    let lagTimer: NodeJS.Timeout;

    if (isNavigating) {
      lagTimer = setTimeout(() => {
        setShowCenterLoader(true);
      }, 200);
    } else {
      setShowCenterLoader(false);
    }

    return () => {
      clearTimeout(lagTimer);
    };
  }, [isNavigating]);

  if (!showCenterLoader) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-black/15 backdrop-blur-[2px] animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E8D9CD] flex flex-col items-center gap-3.5 text-center min-w-[210px] max-w-[280px] animate-in zoom-in-95 duration-200">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-3 border-[#E8D9CD] border-t-[#1F4D3A] border-r-[#D98E3F] animate-spin" />
          <span className="absolute text-base select-none" role="img" aria-label="paw">
            🐾
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-black text-[#2B2622] font-display tracking-tight">
            PetsWorld.pk
          </p>
          <p className="text-xs text-[#6B6560] font-medium">
            Loading pet supplies...
          </p>
        </div>
      </div>
    </div>
  );
}

