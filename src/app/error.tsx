"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { generateReferenceCode } from "@/lib/messages";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [refCode, setRefCode] = useState<string>("");

  useEffect(() => {
    const code = generateReferenceCode();
    setRefCode(code);
    // Log server reference code
    console.error(`[CLIENT_ERROR_BOUNDARY][${code}]:`, error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-[#E8D9CD] shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#FEF2F2] flex items-center justify-center text-[#DC2626]">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#2B2622]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#6B6560] leading-relaxed">
          An unexpected error occurred while loading this page. Our team has been notified.
        </p>

        {refCode && (
          <div className="mt-4 px-3 py-1.5 bg-[#F9EFE4] rounded-lg inline-block text-xs font-mono text-[#6B6560]">
            Reference: {refCode}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4D3A] text-white font-semibold text-sm hover:bg-[#163B2C] transition-colors"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#F4DFCB] text-[#2B2622] font-semibold text-sm hover:bg-[#EBC9AA] transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
