"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PetsWorldLogo } from "@/components/brand/PetsWorldLogo";
import { logoutAdminAction } from "@/actions/auth-actions";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  MessageSquare,
  Mail,
  FileText,
  HelpCircle,
  Home,
  Search,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminMobileNavProps {
  session: {
    name: string;
    email: string;
  };
}

export function AdminMobileNav({ session }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { label: "Inquiries", href: "/admin/messages", icon: Mail },
    { label: "Blog", href: "/admin/blog", icon: FileText },
    { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { label: "Homepage & Hero", href: "/admin/homepage", icon: Home },
    { label: "Page SEO", href: "/admin/seo", icon: Search },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Store Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="md:hidden">
      {/* Mobile Hamburger Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-[#2B2622] hover:bg-[#FFF8F0] border border-[#E8D9CD] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
        aria-label="Open admin navigation menu"
      >
        <Menu className="w-5 h-5 text-[#1F4D3A]" aria-hidden="true" />
      </button>

      {/* Slide-out Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[85vw] bg-[#1F4D3A] text-[#FFF8F0] flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#2D664F] flex items-center justify-between">
              <PetsWorldLogo variant="light" asLink={false} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#F4DFCB] hover:text-white hover:bg-[#2A654D] transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" aria-label="Mobile admin navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#2A654D] text-white font-bold shadow-xs"
                        : "text-[#FFF8F0]/85 hover:text-white hover:bg-[#2A654D]/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#D98E3F]" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer with Session Info & Logout */}
            <div className="p-4 border-t border-[#2D664F] space-y-3 bg-[#173B2C]/50">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F4DFCB]/80 hover:text-white hover:bg-[#2A654D] transition-colors"
              >
                <span>View Live Store</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>

              <div className="pt-2 flex items-center justify-between px-3.5 text-xs text-[#F4DFCB]/70 border-t border-[#2D664F]/50">
                <div className="truncate max-w-[140px]">
                  <p className="font-bold text-white truncate">{session.name}</p>
                  <p className="truncate text-[10px]">{session.email}</p>
                </div>
                <form action={logoutAdminAction}>
                  <button
                    type="submit"
                    title="Sign out"
                    className="p-2 rounded-lg text-[#F4DFCB] hover:text-white hover:bg-[#8E281C] transition-colors flex items-center gap-1 text-xs"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Exit</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
