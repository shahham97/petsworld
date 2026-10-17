import React from "react";
import { db } from "@/lib/db";
import { ReviewsList } from "./ReviewsList";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight flex items-center gap-2">
          <Star className="w-7 h-7 text-[#D98E3F]" />
          <span>Product Reviews Moderation</span>
        </h1>
        <p className="text-xs text-[#6B6560] mt-1">
          Approve or reject customer product reviews before they appear publicly on product pages
        </p>
      </div>

      <ReviewsList initialReviews={reviews} />
    </div>
  );
}
