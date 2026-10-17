import Link from "next/link";
import { Search, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#F4DFCB] flex items-center justify-center text-[#1F4D3A] shadow-inner">
          <Search className="w-10 h-10" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold tracking-widest text-[#D98E3F] uppercase">
          Error 404
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#2B2622] tracking-tight font-display">
          Page Not Found
        </h1>
        <p className="mt-3 text-base text-[#6B6560] leading-relaxed">
          Sorry, we couldn&apos;t find the pet product or page you are looking for. It may have been moved, renamed, or is temporarily unavailable.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1F4D3A] text-white font-semibold text-sm hover:bg-[#163B2C] transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Return Home
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#F4DFCB] text-[#2B2622] font-semibold text-sm hover:bg-[#EBC9AA] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
