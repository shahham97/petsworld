"use client";

import React, { useState } from "react";
import { Search, User, Phone, Mail, MapPin } from "lucide-react";

interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string;
  orderCount: number;
  totalSpent: number;
  createdAt: Date | string;
}

export function CustomersTable({ initialCustomers }: { initialCustomers: CustomerSummary[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622] focus:outline-none focus:border-[#1F4D3A]"
          />
        </div>

        <div className="text-xs text-[#6B6560] font-medium">
          Showing <span className="font-bold text-[#2B2622]">{filtered.length}</span> of{" "}
          <span className="font-bold text-[#2B2622]">{initialCustomers.length}</span> customers
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8D9CD] bg-[#FFF8F0]/50 text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D9CD] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B6560]">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FFF8F0]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#2B2622]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[#2B2622]">{c.phone}</div>
                      {c.email && <div className="text-[11px] text-[#6B6560]">{c.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6560]">{c.city}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#2B2622]">
                      {c.orderCount} order{c.orderCount > 1 ? "s" : ""}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#1F4D3A]">
                      Rs. {c.totalSpent.toLocaleString("en-PK")}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6560]">
                      {new Date(c.createdAt).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
