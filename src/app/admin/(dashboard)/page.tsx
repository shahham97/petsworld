import React from "react";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage/db-storage";
import Link from "next/link";
import {
  HardDrive,
  Clock,
  AlertTriangle,
  ShoppingBag,
  CreditCard,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const lastUpdated = new Date().toLocaleTimeString("en-PK", {
    timeZone: "Asia/Karachi",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Load storage usage from DbStorageProvider
  const storageUsage = await storage.getStorageUsage();

  // Load live store statistics
  const [
    totalProducts,
    lowStockCount,
    totalCategories,
    awaitingVerificationCount,
    totalOrders,
  ] = await Promise.all([
    db.product.count({ where: { deletedAt: null } }),
    db.product.count({
      where: {
        deletedAt: null,
        stockQty: { lte: 5 },
      },
    }),
    db.category.count(),
    db.order.count({
      where: { status: "AWAITING_PAYMENT_VERIFICATION" },
    }),
    db.order.count(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Debug Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#6B6560] mt-1">
            Real-time status of store inventory, orders, and database media assets
          </p>
        </div>

        {/* Debug Last Updated line */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E8D9CD] text-xs font-mono text-[#6B6560]">
          <Clock className="w-3.5 h-3.5 text-[#1F4D3A]" aria-hidden="true" />
          <span>Last live sync: <strong>{lastUpdated} PKT</strong></span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Orders Awaiting Verification */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
              Payment Verification
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
              <CreditCard className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#2B2622]">
              {awaitingVerificationCount}
            </div>
            <p className="text-xs text-[#6B6560] mt-1">
              Orders waiting for admin proof check
            </p>
          </div>
          <Link
            href="/admin/orders?status=AWAITING_PAYMENT_VERIFICATION"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] hover:text-[#163B2C]"
          >
            <span>Review slips</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7]">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#2B2622]">
              {totalOrders}
            </div>
            <p className="text-xs text-[#6B6560] mt-1">
              All lifetime placed orders
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] hover:text-[#163B2C]"
          >
            <span>View all orders</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Published Products */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
              Active Products
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
              <Package className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#2B2622]">
              {totalProducts}
            </div>
            <p className="text-xs text-[#6B6560] mt-1">
              Across {totalCategories} categories
            </p>
          </div>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] hover:text-[#163B2C]"
          >
            <span>Manage catalog</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6560]">
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] flex items-center justify-center text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#2B2622]">
              {lowStockCount}
            </div>
            <p className="text-xs text-[#6B6560] mt-1">
              Items with 5 or fewer units left
            </p>
          </div>
          <Link
            href="/admin/products?filter=low_stock"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#DC2626] hover:text-[#991B1B]"
          >
            <span>Restock inventory</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Database Media Storage Usage Indicator */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8D9CD]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center text-[#1F4D3A]">
              <HardDrive className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2B2622]">
                Database Media Storage Indicator
              </h2>
              <p className="text-xs text-[#6B6560]">
                TiDB Serverless Image Storage & Variant Generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/media"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] transition-colors"
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Open Media Library</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6">
          <div>
            <span className="text-xs text-[#6B6560] font-medium block">Total Storage Used</span>
            <span className="text-2xl font-black text-[#1F4D3A] mt-1 block">
              {storageUsage.formattedTotalSize}
            </span>
            <span className="text-[11px] text-[#6B6560]">LONGBLOB in TiDB</span>
          </div>

          <div>
            <span className="text-xs text-[#6B6560] font-medium block">Stored Assets</span>
            <span className="text-2xl font-black text-[#2B2622] mt-1 block">
              {storageUsage.totalAssets}
            </span>
            <span className="text-[11px] text-[#6B6560]">Unique uploaded files</span>
          </div>

          <div>
            <span className="text-xs text-[#6B6560] font-medium block">Generated Variants</span>
            <span className="text-2xl font-black text-[#2B2622] mt-1 block">
              {storageUsage.totalVariants}
            </span>
            <span className="text-[11px] text-[#6B6560]">thumb, md, lg, og</span>
          </div>

          <div>
            <span className="text-xs text-[#6B6560] font-medium block">Public Images</span>
            <span className="text-2xl font-black text-[#16A34A] mt-1 block">
              {storageUsage.publicAssetsCount}
            </span>
            <span className="text-[11px] text-[#6B6560]">Cached on CDN</span>
          </div>

          <div>
            <span className="text-xs text-[#6B6560] font-medium block">Private Receipts</span>
            <span className="text-2xl font-black text-[#D98E3F] mt-1 block">
              {storageUsage.privateReceiptsCount}
            </span>
            <span className="text-[11px] text-[#6B6560]">Protected admin-only</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF8F0] to-[#F4DFCB]/40 border border-[#E8D9CD]">
          <Package className="w-6 h-6 text-[#D98E3F] mb-3" aria-hidden="true" />
          <h3 className="font-bold text-[#2B2622] text-base">Dynamic Products</h3>
          <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">
            Every product is template-driven from the database with live instant revalidation.
          </p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] hover:underline"
          >
            <span>Manage Products</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF8F0] to-[#F4DFCB]/40 border border-[#E8D9CD]">
          <Layers className="w-6 h-6 text-[#1F4D3A] mb-3" aria-hidden="true" />
          <h3 className="font-bold text-[#2B2622] text-base">Store Settings</h3>
          <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">
            Configure payment methods (COD, Wallets, Bank), WhatsApp widget, and email alerts.
          </p>
          <Link
            href="/admin/settings"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] hover:underline"
          >
            <span>Open Store Settings</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFF8F0] to-[#F4DFCB]/40 border border-[#E8D9CD]">
          <ShoppingBag className="w-6 h-6 text-[#0284C7] mb-3" aria-hidden="true" />
          <h3 className="font-bold text-[#2B2622] text-base">Order Processing</h3>
          <p className="text-xs text-[#6B6560] mt-1 leading-relaxed">
            Review customer payment slips, verify transaction IDs, and track stock movements.
          </p>
          <Link
            href="/admin/orders"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] hover:underline"
          >
            <span>View Orders</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
