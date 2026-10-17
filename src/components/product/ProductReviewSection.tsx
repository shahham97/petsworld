"use client";

import React, { useState, useTransition } from "react";
import { submitReviewAction } from "@/actions/review-actions";
import { useToast } from "@/components/ui/Toast";
import { Star, MessageSquarePlus, CheckCircle2, Loader2 } from "lucide-react";

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export function ProductReviewSection({
  productId,
  reviews,
}: {
  productId: string;
  reviews: ReviewItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("productId", productId);
    fd.append("name", name);
    fd.append("rating", rating.toString());
    fd.append("comment", comment);

    startTransition(async () => {
      const res = await submitReviewAction(fd);
      if (res.success) {
        toast.success(res.message || "Review submitted successfully.");
        setSubmitted(true);
        setName("");
        setComment("");
      } else {
        toast.error(res.message || "Could not submit review.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8D9CD]">
        <div>
          <h2 className="text-2xl font-black text-[#2B2622] tracking-tight">
            Customer Reviews ({reviews.length})
          </h2>
          {averageRating ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-[#D98E3F]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-[#2B2622]">{averageRating} out of 5</span>
            </div>
          ) : (
            <p className="text-xs text-[#6B6560] mt-1">
              Be the first to review this pet product!
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Approved Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#E8D9CD]">
              <p className="text-sm text-[#6B6560]">No verified reviews yet.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#2B2622]">{r.name}</span>
                  <span className="text-[11px] text-[#6B6560]">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex text-[#D98E3F]">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#2B2622] leading-relaxed pt-1">
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Review Form */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-4 h-fit">
          <h3 className="text-base font-bold text-[#2B2622] flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-[#1F4D3A]" />
            <span>Write a Review</span>
          </h3>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs space-y-1">
              <span className="font-bold block">Review Submitted!</span>
              <p>Thank you! Your feedback has been sent for admin verification.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Rating
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-[#D98E3F] hover:scale-110 transition-transform"
                      aria-label={`${s} star rating`}
                    >
                      <Star className={`w-5 h-5 ${s <= rating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8D9CD]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
                  Your Review *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about your pet's experience with this product..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E8D9CD]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Submit Review</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
