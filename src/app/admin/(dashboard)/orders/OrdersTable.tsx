"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Eye, Filter, CheckCircle, Clock, Truck, AlertTriangle } from "lucide-react";
import { OrderStatus, PaymentStatus, PaymentMethodCode } from "@prisma/client";

interface OrderItemSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  city: string;
  total: number;
  paymentMethod: PaymentMethodCode;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: Date | string;
  itemCount: number;
}

export function OrdersTable({ initialOrders }: { initialOrders: OrderItemSummary[] }) {
  const [orders, setOrders] = useState<OrderItemSummary[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "AWAITING_PAYMENT_VERIFICATION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Verify Payment</span>;
      case "CONFIRMED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case "PROCESSING":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Processing</span>;
      case "SHIPPED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Shipped</span>;
      case "DELIVERED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">Delivered</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <span className="text-[11px] font-bold text-emerald-700">PAID</span>;
      case "PENDING_VERIFICATION":
        return <span className="text-[11px] font-bold text-amber-700">PENDING REVIEW</span>;
      case "FAILED":
        return <span className="text-[11px] font-bold text-red-700">FAILED</span>;
      default:
        return <span className="text-[11px] font-bold text-[#6B6560]">UNPAID</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number, customer, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622] focus:outline-none focus:border-[#1F4D3A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-[#E8D9CD] bg-white text-xs font-semibold text-[#2B2622]"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="AWAITING_PAYMENT_VERIFICATION">Awaiting Payment Verification</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-[#E8D9CD] bg-white text-xs font-semibold text-[#2B2622]"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8D9CD] bg-[#FFF8F0]/50 text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                <th className="py-3.5 px-4">Order Number</th>
                <th className="py-3.5 px-4">Customer & City</th>
                <th className="py-3.5 px-4">Items & Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D9CD] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6560]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FFF8F0]/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2B2622]">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="hover:text-[#1F4D3A] transition-colors"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#2B2622]">{o.customerName}</div>
                      <div className="text-[11px] text-[#6B6560]">
                        {o.city} • <span className="font-mono">{o.customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-[#1F4D3A]">
                        Rs. {o.total.toLocaleString("en-PK")}
                      </div>
                      <div className="text-[11px] text-[#6B6560]">
                        {o.itemCount} item{o.itemCount > 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#2B2622]">{o.paymentMethod}</div>
                      <div>{getPaymentBadge(o.paymentStatus)}</div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(o.status)}</td>
                    <td className="py-3.5 px-4 text-[#6B6560]">
                      {new Date(o.createdAt).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] hover:bg-[#FFF8F0] shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
