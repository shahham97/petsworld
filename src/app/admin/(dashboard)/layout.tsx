import React from "react";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PetsWorldLogo } from "@/components/brand/PetsWorldLogo";
import { logoutAdminAction } from "@/actions/auth-actions";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import {
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

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

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
    <div className="h-screen w-full overflow-hidden bg-[#FDF9F4] flex">
      {/* Sidebar - Fixed/Sticky full-height */}
      <aside className="w-64 h-full bg-[#1F4D3A] text-[#FFF8F0] shrink-0 hidden md:flex flex-col border-r border-[#173B2C]">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-[#2D664F] flex items-center justify-between">
          <PetsWorldLogo variant="light" asLink={true} />
        </div>

        {/* Navigation Links (Scrollable with scrollbar visually hidden) */}
        <nav
          className="flex-1 px-4 py-6 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Admin navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-[#FFF8F0]/85 hover:text-white hover:bg-[#2A654D] transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0 text-[#D98E3F]" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Session & Public Link */}
        <div className="p-4 border-t border-[#2D664F] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F4DFCB]/80 hover:text-white hover:bg-[#2A654D] transition-colors"
          >
            <span>View Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>

          <div className="pt-2 flex items-center justify-between px-3.5 text-xs text-[#F4DFCB]/70">
            <div className="truncate max-w-[130px]">
              <p className="font-bold text-white truncate">{session.name}</p>
              <p className="truncate text-[10px]">{session.email}</p>
            </div>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 rounded-lg text-[#F4DFCB] hover:text-white hover:bg-[#8E281C] transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Header pinned, content scrollable) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Pinned / Sticky Top Navbar */}
        <header className="sticky top-0 z-30 h-16 shrink-0 bg-white border-b border-[#E8D9CD] px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <AdminMobileNav session={session} />
            <span className="text-xs font-bold uppercase tracking-wider text-[#D98E3F] bg-[#FFF8F0] px-2.5 py-1 rounded-lg border border-[#E8D9CD]">
              Admin Portal
            </span>
            <span className="text-sm font-bold text-[#2B2622] hidden min-[400px]:inline">PetsWorld.pk</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B6560] hidden sm:inline">
              Signed in as <strong className="text-[#1F4D3A]">{session.email}</strong>
            </span>
            <form action={logoutAdminAction} className="md:hidden">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] text-[#991B1B] text-xs font-bold hover:bg-[#FEE2E2]"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </header>

        {/* Scrollable Page Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
