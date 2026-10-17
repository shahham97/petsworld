"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import {
  toggleProductPublishedAction,
  toggleProductFeaturedAction,
  softDeleteProductAction,
} from "@/actions/product-actions";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import { Edit2, Trash2, ExternalLink, Star } from "lucide-react";

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  salePrice: string | null;
  stockQty: number;
  lowStockThreshold: number;
  isPublished: boolean;
  isFeatured: boolean;
  images: { assetId: string; altText: string | null }[];
  categories: { category: { name: string } }[];
}

export function ProductsTable({ products }: { products: AdminProductItem[] }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handlePublishedToggle = (id: string, currentState: boolean) => {
    startTransition(async () => {
      const res = await toggleProductPublishedAction(id, !currentState);
      if (res.success) {
        toast.success("Product publication status updated.");
      } else {
        toast.error(res.error || "Failed to update.");
      }
    });
  };

  const handleFeaturedToggle = (id: string, currentState: boolean) => {
    startTransition(async () => {
      const res = await toggleProductFeaturedAction(id, !currentState);
      if (res.success) {
        toast.success(
          !currentState
            ? "Product marked as Featured (visible in homepage slider)."
            : "Product removed from Featured slider."
        );
      } else {
        toast.error(res.error || "Failed to update.");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will soft-delete the product.`)) return;

    startTransition(async () => {
      const res = await softDeleteProductAction(id);
      if (res.success) {
        toast.success(`Product "${name}" deleted.`);
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    });
  };

  if (products.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-[#E8D9CD]">
        <p className="text-sm text-[#6B6560]">No products found in the catalog.</p>
        <Link
          href="/admin/products/new"
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C]"
        >
          Create First Product
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FFF8F0] border-b border-[#E8D9CD] text-[11px] font-bold uppercase tracking-wider text-[#6B6560]">
            <tr>
              <th className="py-4 px-6">Product</th>
              <th className="py-4 px-4">SKU</th>
              <th className="py-4 px-4">Categories</th>
              <th className="py-4 px-4">Price (PKR)</th>
              <th className="py-4 px-4 text-center">Stock</th>
              <th className="py-4 px-4 text-center">Published</th>
              <th className="py-4 px-4 text-center">Featured</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8D9CD]">
            {products.map((p) => {
              const mainImage = p.images[0]?.assetId;
              const isLowStock = p.stockQty <= p.lowStockThreshold;

              return (
                <tr key={p.id} className="hover:bg-[#FFF8F0]/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-[#F4DFCB]/40 border border-[#E8D9CD] overflow-hidden shrink-0">
                        {mainImage ? (
                          <Image
                            src={`/media/${mainImage}/thumb`}
                            alt={p.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#1F4D3A] font-bold text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="max-w-xs">
                        <span className="font-bold text-[#2B2622] block truncate" title={p.name}>
                          {p.name}
                        </span>
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="text-[11px] text-[#1F4D3A] hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          <span>/{p.slug}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-xs text-[#6B6560]">
                    {p.sku}
                  </td>

                  <td className="py-4 px-4 text-xs text-[#2B2622]">
                    <div className="flex flex-wrap gap-1">
                      {p.categories.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#FFF8F0] border border-[#E8D9CD] text-[10px] font-semibold text-[#1F4D3A]"
                        >
                          {c.category.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-[#2B2622]">
                    {p.salePrice ? (
                      <div>
                        <span className="text-[#16A34A] font-bold block">Rs. {p.salePrice}</span>
                        <span className="text-[#6B6560] line-through text-[10px]">Rs. {p.price}</span>
                      </div>
                    ) : (
                      <span>Rs. {p.price}</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.stockQty === 0
                          ? "bg-[#FEE2E2] text-[#991B1B]"
                          : isLowStock
                          ? "bg-[#FEF3C7] text-[#92400E]"
                          : "bg-[#DCFCE7] text-[#166534]"
                      }`}
                    >
                      {p.stockQty} {p.stockQty === 0 ? "(Out)" : ""}
                    </span>
                  </td>

                  {/* Inline Published Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={p.isPublished}
                      disabled={isPending}
                      onChange={() => handlePublishedToggle(p.id, p.isPublished)}
                      className="w-4 h-4 rounded text-[#1F4D3A] focus:ring-[#1F4D3A] cursor-pointer"
                      title={p.isPublished ? "Click to unpublish" : "Click to publish"}
                    />
                  </td>

                  {/* Inline Featured Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleFeaturedToggle(p.id, p.isFeatured)}
                      disabled={isPending}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.isFeatured
                          ? "text-[#D98E3F] hover:bg-[#FEF3C7]"
                          : "text-[#6B6560]/40 hover:text-[#D98E3F]"
                      }`}
                      title={p.isFeatured ? "Featured in slider" : "Not featured"}
                    >
                      <Star className={`w-4 h-4 ${p.isFeatured ? "fill-current" : ""}`} />
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#1F4D3A] hover:bg-[#F4DFCB]/60 transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                        title="Soft delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
