"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PetsWorldLogo } from "@/components/brand/PetsWorldLogo";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface HeaderProps {
  announcementText?: string | null;
  announcementEnabled?: boolean;
}

export function Header({
  announcementText = "🐾 Free delivery across Pakistan on orders over Rs. 3,000!",
  announcementEnabled = true,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-[#E8D9CD] ${
        isScrolled ? "shadow-sm" : "shadow-2xs"
      }`}
    >
      {/* Announcement Bar */}
      {announcementEnabled && announcementText && (
        <div className="bg-[#1F4D3A] text-[#FFF8F0] text-xs font-semibold py-1.5 px-4 text-center tracking-wide">
          <span>{announcementText}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="shrink-0">
            <PetsWorldLogo />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? "text-[#1F4D3A] font-bold"
                      : "text-[#2B2622]/80 hover:text-[#1F4D3A]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/shop"
              className="p-2.5 rounded-full text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors focus:ring-2 focus:ring-[#1F4D3A]"
              aria-label="Search pet products"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </Link>

            <Link
              href="/admin"
              className="p-2.5 rounded-full text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors focus:ring-2 focus:ring-[#1F4D3A]"
              aria-label="Admin portal"
            >
              <User className="w-5 h-5" aria-hidden="true" />
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors focus:ring-2 focus:ring-[#1F4D3A]"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {/* Cart badge */}
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#D98E3F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2.5 rounded-full text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors focus:ring-2 focus:ring-[#1F4D3A] cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1F4D3A]" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6 text-[#2B2622]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Wrapper */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-wrapper"
          className="md:hidden border-t border-[#E8D9CD] bg-[#FFF8F0] shadow-xl px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200"
        >
          {/* Mobile Quick Search Bar */}
          <form method="GET" action="/shop" className="relative mb-2">
            <input
              type="text"
              name="q"
              placeholder="Search pet food, toys, treats..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-[#E8D9CD] bg-white text-base sm:text-xs text-[#2B2622] placeholder:text-[#6B6560]/70 focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
            />
            <Search className="w-4 h-4 text-[#6B6560] absolute left-3 top-3.5 pointer-events-none" />
          </form>

          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-bold transition-colors ${
                    isActive
                      ? "bg-[#1F4D3A] text-white shadow-xs"
                      : "text-[#2B2622] hover:bg-[#F4DFCB]/60 active:bg-[#F4DFCB]"
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="text-xs opacity-60">→</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Support / Contact Callout in Drawer */}
          <div className="pt-3 border-t border-[#E8D9CD]/70 flex items-center justify-between text-xs text-[#6B6560]">
            <span>Helpline: <strong className="text-[#1F4D3A]">0300-1234567</strong></span>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#D98E3F] font-bold hover:underline"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
