"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { handleServerError } from "@/lib/messages";

const ContactMessageSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please provide a valid email address."),
  phone: z.string().trim().optional(),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});

export async function submitContactMessageAction(rawInput: unknown) {
  const validated = ContactMessageSchema.safeParse(rawInput);
  if (!validated.success) {
    return { success: false, error: "Please correct the errors in the form." };
  }

  const data = validated.data;

  try {
    await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || "General Inquiry",
        message: data.message,
        status: "UNREAD",
      },
    });

    return {
      success: true,
      message: "Thank you for contacting PetsWorld! Our team will get back to you shortly.",
    };
  } catch (error: any) {
    const safe = handleServerError(error, "SUBMIT_CONTACT");
    return { success: false, error: safe.error };
  }
}

export async function markContactMessageReadAction(id: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.contactMessage.update({
      where: { id },
      data: { status: "READ" },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "UPDATE_CONTACT");
    return { success: false, error: safe.error };
  }
}

export async function deleteContactMessageAction(id: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.contactMessage.delete({ where: { id } });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "DELETE_CONTACT");
    return { success: false, error: safe.error };
  }
}
