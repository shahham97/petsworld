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
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#FFF8F0]/90 backdrop-blur-md shadow-xs border-b border-[#E8D9CD]/70"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Announcement Bar */}
      {announcementEnabled && announcementText && (
        <div className="bg-[#1F4D3A]/90 backdrop-blur-sm text-[#FFF8F0] text-xs font-semibold py-1.5 px-4 text-center tracking-wide">
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-full text-[#2B2622] hover:bg-[#F4DFCB]/60 transition-colors focus:ring-2 focus:ring-[#1F4D3A]"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8D9CD] bg-[#FFF8F0] px-4 pt-4 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? "bg-[#1F4D3A] text-white"
                    : "text-[#2B2622] hover:bg-[#F4DFCB]/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
