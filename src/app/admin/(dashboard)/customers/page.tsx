import React from "react";
import { db } from "@/lib/db";
import { CustomersTable } from "./CustomersTable";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const rawCustomers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: {
          total: true,
          status: true,
        },
      },
      addresses: {
        take: 1,
        select: { city: true },
      },
    },
  });

  const customers = rawCustomers.map((c) => {
    const totalSpent = c.orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.total), 0);

    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName || ""}`.trim(),
      phone: c.phone,
      email: c.email,
      city: c.addresses[0]?.city || "Pakistan",
      orderCount: c.orders.length,
      totalSpent,
      createdAt: c.createdAt,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight flex items-center gap-2">
          <Users className="w-7 h-7 text-[#1F4D3A]" />
          <span>Customer Directory</span>
        </h1>
        <p className="text-xs text-[#6B6560] mt-1">
          Registered customer accounts, contact numbers, order volumes, and lifetime spend
        </p>
      </div>

      <CustomersTable initialCustomers={customers} />
    </div>
  );
}
