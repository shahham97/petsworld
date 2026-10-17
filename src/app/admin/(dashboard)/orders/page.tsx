import React from "react";
import { db } from "@/lib/db";
import { OrdersTable } from "./OrdersTable";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rawOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: { id: true },
      },
    },
  });

  const orders = rawOrders.map((o) => {
    const customer = o.customerSnapshot as any;
    const address = o.addressSnapshot as any;

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: `${customer?.firstName || "Customer"} ${customer?.lastName || ""}`.trim(),
      customerPhone: customer?.phone || "",
      city: address?.city || "Pakistan",
      total: Number(o.total),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt,
      itemCount: o.items.length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-[#1F4D3A]" />
          <span>Customer Orders & Pipeline</span>
        </h1>
        <p className="text-xs text-[#6B6560] mt-1">
          Verify Easypaisa/JazzCash/Bank receipts, dispatch courier packages, and audit order histories
        </p>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}
