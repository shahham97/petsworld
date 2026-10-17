"use client";

import React, { useTransition } from "react";
import { toggleCategoryActiveAction, deleteCategoryAction } from "@/actions/category-actions";
import { CategoryFormModal } from "./CategoryFormModal";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import { Edit2, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  imageAssetId: string | null;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  parent?: { id: string; name: string } | null;
  _count: { products: number; children: number };
}

export function CategoryTable({
  categories,
  parentOptions,
}: {
  categories: CategoryItem[];
  parentOptions: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleToggle = (id: string, currentState: boolean) => {
    startTransition(async () => {
      const res = await toggleCategoryActiveAction(id, !currentState);
      if (res.success) {
        toast.success("Category visibility updated.");
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        toast.success(`Category "${name}" deleted.`);
      } else {
        toast.error(res.error || "Failed to delete category.");
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FFF8F0] border-b border-[#E8D9CD] text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
            <tr>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-4">Slug</th>
              <th className="py-4 px-4">Parent</th>
              <th className="py-4 px-4 text-center">Products</th>
              <th className="py-4 px-4 text-center">Order</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8D9CD]">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-[#FFF8F0]/40 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-[#F4DFCB]/40 border border-[#E8D9CD] overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#1F4D3A]">
                      {cat.imageAssetId ? (
                        <Image
                          src={`/media/${cat.imageAssetId}/thumb`}
                          alt={cat.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        cat.name.slice(0, 1)
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-[#2B2622] block">{cat.name}</span>
                      {cat._count.children > 0 && (
                        <span className="text-[10px] text-[#D98E3F] font-bold">
                          {cat._count.children} subcategories
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 font-mono text-xs text-[#6B6560]">
                  {cat.slug}
                </td>
                <td className="py-4 px-4 text-xs text-[#2B2622]">
                  {cat.parent ? cat.parent.name : <span className="text-[#6B6560]/60">—</span>}
                </td>
                <td className="py-4 px-4 text-center text-xs font-semibold text-[#2B2622]">
                  {cat._count.products}
                </td>
                <td className="py-4 px-4 text-center text-xs font-mono text-[#6B6560]">
                  {cat.sortOrder}
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggle(cat.id, cat.isActive)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      cat.isActive
                        ? "bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]"
                        : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="inline-flex items-center gap-2">
                    <CategoryFormModal
                      category={cat}
                      parentOptions={parentOptions}
                      trigger={
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#1F4D3A] hover:bg-[#F4DFCB]/60 transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={isPending || cat._count.children > 0}
                      className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#6B6560]"
                      title={cat._count.children > 0 ? "Cannot delete category with subcategories" : "Delete category"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
