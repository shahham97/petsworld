"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Star, CheckCircle, XCircle, Trash2, Loader2, MessageSquare } from "lucide-react";
import { updateReviewStatusAction, deleteReviewAction } from "@/actions/review-actions";
import { useToast } from "@/components/ui/Toast";
import { ReviewStatus } from "@prisma/client";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  name: string;
  status: ReviewStatus;
  createdAt: Date | string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export function ReviewsList({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [filter, setFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const toast = useToast();

  const filtered = reviews.filter((r) => (filter === "ALL" ? true : r.status === filter));

  const handleStatusChange = (id: string, status: ReviewStatus) => {
    setProcessingId(id);
    startTransition(async () => {
      const res = await updateReviewStatusAction(id, status);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        toast.success(`Review ${status.toLowerCase()}.`);
      } else {
        toast.error(res.error || "Failed to update review.");
      }
      setProcessingId(null);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setProcessingId(id);
    startTransition(async () => {
      const res = await deleteReviewAction(id);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        toast.success("Review deleted.");
      } else {
        toast.error(res.error || "Failed to delete review.");
      }
      setProcessingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === s
                  ? "bg-[#1F4D3A] text-white shadow-2xs"
                  : "bg-white border border-[#E8D9CD] text-[#6B6560] hover:bg-[#FFF8F0]"
              }`}
            >
              {s === "ALL" ? "All Reviews" : s}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#6B6560]">
          Total: <strong className="text-[#2B2622]">{filtered.length}</strong>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-12 text-center text-[#6B6560]">
            <MessageSquare className="w-8 h-8 text-[#6B6560]/40 mx-auto mb-2" />
            No reviews match the selected filter.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-[#E8D9CD] p-5 sm:p-6 space-y-3 shadow-xs hover:border-[#1F4D3A]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8D9CD]/50">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-[#D98E3F]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? "fill-current" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-xs text-[#2B2622]">{r.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : r.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="text-[11px] text-[#6B6560]">
                    {new Date(r.createdAt).toLocaleDateString("en-PK")}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#6B6560] mb-1">
                  Product:{" "}
                  <Link
                    href={`/product/${r.product.slug}`}
                    target="_blank"
                    className="font-bold text-[#1F4D3A] hover:underline"
                  >
                    {r.product.name}
                  </Link>
                </p>
                <p className="text-xs text-[#2B2622] leading-relaxed mt-1">{r.comment}</p>
              </div>

              {/* Moderation Controls */}
              <div className="pt-2 border-t border-[#E8D9CD]/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {r.status !== "APPROVED" && (
                    <button
                      type="button"
                      disabled={isPending && processingId === r.id}
                      onClick={() => handleStatusChange(r.id, "APPROVED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                  {r.status !== "REJECTED" && (
                    <button
                      type="button"
                      disabled={isPending && processingId === r.id}
                      onClick={() => handleStatusChange(r.id, "REJECTED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isPending && processingId === r.id}
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
