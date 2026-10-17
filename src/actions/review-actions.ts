"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { handleServerError } from "@/lib/messages";
import { ReviewStatus } from "@prisma/client";

const ReviewSubmissionSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Review must be at least 5 characters."),
});

export async function submitReviewAction(formData: FormData) {
  const rawInput = {
    productId: formData.get("productId"),
    name: formData.get("name"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  };

  const validated = ReviewSubmissionSchema.safeParse(rawInput);
  if (!validated.success) {
    return { success: false, message: "Please fill in all review fields correctly." };
  }

  const data = validated.data;

  try {
    const product = await db.product.findUnique({ where: { id: data.productId } });
    if (!product) return { success: false, message: "Product not found." };

    await db.review.create({
      data: {
        productId: data.productId,
        name: data.name,
        rating: data.rating,
        comment: data.comment,
        status: ReviewStatus.PENDING,
      },
    });

    return {
      success: true,
      message: "Thank you for your review! It has been submitted for moderation.",
    };
  } catch (error: any) {
    const safe = handleServerError(error, "SUBMIT_REVIEW");
    return { success: false, message: safe.error };
  }
}

export async function updateReviewStatusAction(reviewId: string, status: ReviewStatus) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const review = await db.review.update({
      where: { id: reviewId },
      data: { status },
      select: { product: { select: { slug: true } } },
    });

    revalidatePath("/admin/reviews");
    if (review.product?.slug) {
      revalidatePath(`/product/${review.product.slug}`);
    }
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "UPDATE_REVIEW");
    return { success: false, error: safe.error };
  }
}

export async function deleteReviewAction(reviewId: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const review = await db.review.delete({
      where: { id: reviewId },
      select: { product: { select: { slug: true } } },
    });

    revalidatePath("/admin/reviews");
    if (review.product?.slug) {
      revalidatePath(`/product/${review.product.slug}`);
    }
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "DELETE_REVIEW");
    return { success: false, error: safe.error };
  }
}
