import React from "react";
import { db } from "@/lib/db";
import { CategoryTable } from "./CategoryTable";
import { CategoryFormModal } from "./CategoryFormModal";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  const parentOptions = categories
    .filter((c) => !c.parentId)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            Categories & Hierarchy
          </h1>
          <p className="text-sm text-[#6B6560] mt-1">
            Manage top-level pet types (Cat, Dog, Bird) and departmental subcategories
          </p>
        </div>

        <CategoryFormModal parentOptions={parentOptions} />
      </div>

      <CategoryTable categories={categories} parentOptions={parentOptions} />
    </div>
  );
}
