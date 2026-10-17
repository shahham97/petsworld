"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { handleServerError } from "@/lib/messages";

const PageSeoSchema = z.object({
  pageKey: z.string().min(1),
  seoTitle: z.string().trim().min(3, "Title must be at least 3 characters."),
  seoDescription: z.string().trim().min(10, "Description must be at least 10 characters."),
  editableIntroText: z.string().trim().optional(),
  ogAssetId: z.string().nullable().optional(),
});

export async function savePageSeoAction(rawInput: unknown) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const validated = PageSeoSchema.safeParse(rawInput);
  if (!validated.success) {
    return { success: false, error: "Please correct errors in SEO form." };
  }

  const { pageKey, seoTitle, seoDescription, editableIntroText, ogAssetId } = validated.data;

  try {
    await db.pageSeo.upsert({
      where: { pageKey },
      update: {
        seoTitle,
        seoDescription,
        editableIntroText: editableIntroText || null,
        ogAssetId: ogAssetId || null,
      },
      create: {
        pageKey,
        seoTitle,
        seoDescription,
        editableIntroText: editableIntroText || null,
        ogAssetId: ogAssetId || null,
      },
    });

    // Revalidate paths affected
    const pathMap: Record<string, string> = {
      home: "/",
      shop: "/shop",
      categories: "/categories",
      blog: "/blog",
      contact: "/contact",
    };

    if (pathMap[pageKey]) {
      revalidatePath(pathMap[pageKey]);
    }
    revalidatePath("/admin/seo");

    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "SAVE_SEO");
    return { success: false, error: safe.error };
  }
}
