"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { invalidateSettingsCache } from "@/lib/cache";
import { handleServerError } from "@/lib/messages";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { PaymentMethodCode } from "@prisma/client";

export async function saveGeneralSettingsAction(data: {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  announcementBarText?: string | null;
  announcementBarEnabled: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.storeSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });
    invalidateSettingsCache();
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_GENERAL_SETTINGS");
    return { success: false, error: safe.error };
  }
}

export async function saveShippingSettingsAction(data: {
  shippingFlatFee: number;
  freeShippingThreshold: number;
  serviceableProvinces: string[];
  serviceableCities: string[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.storeSettings.upsert({
      where: { id: "default" },
      update: {
        shippingFlatFee: data.shippingFlatFee,
        freeShippingThreshold: data.freeShippingThreshold,
        serviceableProvinces: data.serviceableProvinces,
        serviceableCities: data.serviceableCities,
      },
      create: {
        id: "default",
        shippingFlatFee: data.shippingFlatFee,
        freeShippingThreshold: data.freeShippingThreshold,
        serviceableProvinces: data.serviceableProvinces,
        serviceableCities: data.serviceableCities,
      },
    });
    invalidateSettingsCache();
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_SHIPPING_SETTINGS");
    return { success: false, error: safe.error };
  }
}

export async function savePaymentMethodAction(data: {
  code: PaymentMethodCode;
  label: string;
  isEnabled: boolean;
  sortOrder: number;
  instructions?: string | null;
  accountTitle?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  iban?: string | null;
  branch?: string | null;
  maxCodAmount?: number | null;
  requireReceipt: boolean;
  fields: unknown;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.paymentMethod.update({
      where: { code: data.code },
      data: {
        label: data.label,
        isEnabled: data.isEnabled,
        sortOrder: data.sortOrder,
        instructions: data.instructions,
        accountTitle: data.accountTitle,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        iban: data.iban,
        branch: data.branch,
        maxCodAmount: data.maxCodAmount,
        requireReceipt: data.requireReceipt,
        fields: data.fields as any,
      },
    });
    invalidateSettingsCache();
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_PAYMENT_METHOD");
    return { success: false, error: safe.error };
  }
}

export async function saveWhatsAppSettingsAction(data: {
  whatsAppEnabled: boolean;
  whatsAppNumber: string;
  whatsAppPrefilledMessage: string;
  whatsAppButtonLabel: string;
  whatsAppButtonSide: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  // Normalize Pakistani mobile format (03XXXXXXXXX -> 923XXXXXXXXX)
  let cleanNumber = data.whatsAppNumber.replace(/\D/g, "");
  if (cleanNumber.startsWith("03") && cleanNumber.length === 11) {
    cleanNumber = "92" + cleanNumber.slice(1);
  } else if (cleanNumber.startsWith("923") && cleanNumber.length === 12) {
    // already international
  } else if (cleanNumber.startsWith("+923")) {
    cleanNumber = cleanNumber.slice(1);
  }

  if (cleanNumber.length < 10) {
    return { success: false, error: "Please enter a valid Pakistani mobile number (e.g. 03001234567 or 923001234567)." };
  }

  try {
    await db.storeSettings.upsert({
      where: { id: "default" },
      update: {
        whatsAppEnabled: data.whatsAppEnabled,
        whatsAppNumber: cleanNumber,
        whatsAppPrefilledMessage: data.whatsAppPrefilledMessage,
        whatsAppButtonLabel: data.whatsAppButtonLabel,
        whatsAppButtonSide: data.whatsAppButtonSide,
      },
      create: {
        id: "default",
        whatsAppEnabled: data.whatsAppEnabled,
        whatsAppNumber: cleanNumber,
        whatsAppPrefilledMessage: data.whatsAppPrefilledMessage,
        whatsAppButtonLabel: data.whatsAppButtonLabel,
        whatsAppButtonSide: data.whatsAppButtonSide,
      },
    });
    invalidateSettingsCache();
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_WHATSAPP_SETTINGS");
    return { success: false, error: safe.error };
  }
}

export async function saveEmailSettingsAction(data: {
  emailEnabled: boolean;
  emailFromName: string;
  emailReplyTo: string;
  emailNotificationToggles: Record<string, boolean>;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.storeSettings.upsert({
      where: { id: "default" },
      update: {
        emailEnabled: data.emailEnabled,
        emailFromName: data.emailFromName,
        emailReplyTo: data.emailReplyTo,
        emailNotificationToggles: data.emailNotificationToggles,
      },
      create: {
        id: "default",
        emailEnabled: data.emailEnabled,
        emailFromName: data.emailFromName,
        emailReplyTo: data.emailReplyTo,
        emailNotificationToggles: data.emailNotificationToggles,
      },
    });
    invalidateSettingsCache();
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_EMAIL_SETTINGS");
    return { success: false, error: safe.error };
  }
}

export async function sendTestEmailAction(recipientEmail: string): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "PetsWorld <orders@petsworld.pk>";

  if (!apiKey) {
    return { success: false, error: "Resend is not configured yet. Please set RESEND_API_KEY in environment variables." };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: recipientEmail,
      subject: "PetsWorld Test Notification",
      html: "<p>This is a test notification from your PetsWorld store.</p>",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error sending test email";
    return { success: false, error: msg };
  }
}
