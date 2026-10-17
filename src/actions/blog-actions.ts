"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { invalidateBlogCache } from "@/lib/cache";
import { sanitizeRichText } from "@/lib/sanitize";
import { handleServerError } from "@/lib/messages";
import { revalidatePath } from "next/cache";
import { BlogStatus } from "@prisma/client";

const BlogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  slug: z.string().trim().min(3, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens."),
  excerpt: z.string().trim().min(10, "Excerpt is required for cards and search snippets."),
  coverAssetId: z.string().nullable().optional(),
  coverAlt: z.string().trim().optional(),
  content: z.string().trim().min(20, "Content must be at least 20 characters."),
  authorName: z.string().trim().default("PetsWorld Team"),
  status: z.nativeEnum(BlogStatus).default("DRAFT"),
  readingTimeMin: z.coerce.number().int().min(1).default(3),
  tags: z.string().trim().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
  canonicalUrl: z.string().trim().optional(),
  relatedProductIds: z.array(z.string()).default([]),
  faqs: z.array(z.object({
    id: z.string().optional(),
    question: z.string().trim(),
    answer: z.string().trim(),
  })).default([]),
});

export async function saveBlogPostAction(rawData: unknown): Promise<{ success: boolean; postId?: string; error?: string; fieldErrors?: Record<string, string[]> }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const validated = BlogPostSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, fieldErrors: validated.error.flatten().fieldErrors, error: "Please correct form errors." };
  }

  const data = validated.data;

  try {
    const existing = await db.blogPost.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== data.id) {
      return { success: false, fieldErrors: { slug: ["This slug is already used by another post."] }, error: "Slug must be unique." };
    }

    const sanitizedContent = sanitizeRichText(data.content);
    const publishedAt = data.status === "PUBLISHED" ? new Date() : null;

    const post = await db.$transaction(async (tx) => {
      let saved;
      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        coverAssetId: data.coverAssetId || null,
        coverAlt: data.coverAlt || data.title,
        content: sanitizedContent,
        authorName: data.authorName,
        status: data.status,
        publishedAt,
        readingTimeMin: data.readingTimeMin,
        tags: data.tags || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        canonicalUrl: data.canonicalUrl || null,
        ogAssetId: data.coverAssetId || null,
      };

      if (data.id) {
        saved = await tx.blogPost.update({
          where: { id: data.id },
          data: payload,
        });

        await tx.blogRelatedProduct.deleteMany({ where: { postId: saved.id } });
        await tx.faq.deleteMany({ where: { scopeType: "BLOG_POST", scopeKey: saved.id } });
      } else {
        saved = await tx.blogPost.create({
          data: payload,
        });
      }

      // Link related products
      for (let i = 0; i < data.relatedProductIds.length; i++) {
        await tx.blogRelatedProduct.create({
          data: {
            postId: saved.id,
            productId: data.relatedProductIds[i],
            sortOrder: i,
          },
        });
      }

      // Link scoped FAQs
      for (let i = 0; i < data.faqs.length; i++) {
        const f = data.faqs[i];
        if (f.question.trim() && f.answer.trim()) {
          await tx.faq.create({
            data: {
              question: f.question.trim(),
              answer: f.answer.trim(),
              scopeType: "BLOG_POST",
              scopeKey: saved.id,
              sortOrder: i,
              isActive: true,
            },
          });
        }
      }

      return saved;
    });

    invalidateBlogCache(post.slug);
    revalidatePath("/admin/blog");
    return { success: true, postId: post.id };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_BLOG_POST");
    return { success: false, error: safe.error };
  }
}

export async function deleteBlogPostAction(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const post = await db.blogPost.delete({
      where: { id },
      select: { slug: true },
    });
    invalidateBlogCache(post.slug);
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "DELETE_BLOG_POST");
    return { success: false, error: safe.error };
  }
}
