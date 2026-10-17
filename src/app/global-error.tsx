"use client";

import { useEffect, useState } from "react";
import { generateReferenceCode } from "@/lib/messages";

export default function GlobalError({
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
    console.error(`[GLOBAL_ERROR][${code}]:`, error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#FFF8F0] text-[#2B2622] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-[#E8D9CD] shadow-md">
          <h1 className="text-2xl font-bold text-[#1F4D3A]">Application Error</h1>
          <p className="mt-2 text-sm text-[#6B6560]">
            A critical system error occurred. Please refresh the page or try again in a few moments.
          </p>
          {refCode && (
            <p className="mt-3 text-xs font-mono text-[#6B6560] bg-[#F9EFE4] p-2 rounded-lg inline-block">
              Reference: {refCode}
            </p>
          )}
          <div className="mt-6">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-full bg-[#1F4D3A] text-white font-semibold text-sm hover:bg-[#163B2C] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
