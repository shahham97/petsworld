"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { invalidateFaqsCache } from "@/lib/cache";
import { handleServerError } from "@/lib/messages";
import { revalidatePath } from "next/cache";
import { FaqScopeType } from "@prisma/client";

const FaqInputSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(5, "Question must be at least 5 characters."),
  answer: z.string().trim().min(5, "Answer must be at least 5 characters."),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
  scopeType: z.nativeEnum(FaqScopeType).default("GLOBAL"),
  scopeKey: z.string().trim().nullable().optional(),
});

export async function saveFaqAction(rawData: unknown): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const validated = FaqInputSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, error: "Please enter a valid question and answer." };
  }

  const { id, question, answer, sortOrder, isActive, scopeType, scopeKey } = validated.data;

  try {
    if (id) {
      await db.faq.update({
        where: { id },
        data: {
          question,
          answer,
          sortOrder,
          isActive,
          scopeType,
          scopeKey: scopeKey || null,
        },
      });
    } else {
      await db.faq.create({
        data: {
          question,
          answer,
          sortOrder,
          isActive,
          scopeType,
          scopeKey: scopeKey || null,
        },
      });
    }

    invalidateFaqsCache();
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_FAQ");
    return { success: false, error: safe.error };
  }
}

export async function toggleFaqActiveAction(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.faq.update({
      where: { id },
      data: { isActive },
    });
    invalidateFaqsCache();
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "TOGGLE_FAQ");
    return { success: false, error: safe.error };
  }
}

export async function deleteFaqAction(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.faq.delete({ where: { id } });
    invalidateFaqsCache();
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "DELETE_FAQ");
    return { success: false, error: safe.error };
  }
}
