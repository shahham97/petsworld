import { Resend } from "resend";
import { db } from "@/lib/db";
import { EmailStatus } from "@prisma/client";

interface EmailParams {
  orderId?: string;
  template: string;
  recipient: string;
  subject: string;
  htmlContent: string;
}

export async function sendTransactionalEmail({
  orderId,
  template,
  recipient,
  subject,
  htmlContent,
}: EmailParams): Promise<{ success: boolean; status: EmailStatus; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim() || "orders@petsworld.pk";

  // Check store settings email toggle
  try {
    const settings = await db.storeSettings.findUnique({
      where: { id: "default" },
      select: { emailEnabled: true, emailFromName: true, emailNotificationToggles: true },
    });

    if (settings && !settings.emailEnabled) {
      await db.emailLog.create({
        data: {
          orderId: orderId || null,
          template,
          recipient,
          status: EmailStatus.SKIPPED_NOT_CONFIGURED,
          sanitizedError: "Email sending disabled in store settings",
        },
      });
      return { success: true, status: EmailStatus.SKIPPED_NOT_CONFIGURED };
    }

    if (!apiKey) {
      // Log as SKIPPED_NOT_CONFIGURED
      await db.emailLog.create({
        data: {
          orderId: orderId || null,
          template,
          recipient,
          status: EmailStatus.SKIPPED_NOT_CONFIGURED,
          sanitizedError: "RESEND_API_KEY is not configured",
        },
      });
      return { success: true, status: EmailStatus.SKIPPED_NOT_CONFIGURED };
    }

    const resend = new Resend(apiKey);
    const sender = settings?.emailFromName ? `${settings.emailFromName} <${fromEmail}>` : fromEmail;

    const res = await resend.emails.send({
      from: sender,
      to: recipient,
      subject,
      html: htmlContent,
    });

    if (res.error) {
      await db.emailLog.create({
        data: {
          orderId: orderId || null,
          template,
          recipient,
          status: EmailStatus.FAILED,
          sanitizedError: res.error.message.slice(0, 500),
        },
      });
      return { success: false, status: EmailStatus.FAILED, error: res.error.message };
    }

    await db.emailLog.create({
      data: {
        orderId: orderId || null,
        template,
        recipient,
        status: EmailStatus.SENT,
        providerMessageId: res.data?.id || null,
      },
    });

    return { success: true, status: EmailStatus.SENT, messageId: res.data?.id };
  } catch (error: any) {
    console.error("[Email Error]:", error?.message || error);
    try {
      await db.emailLog.create({
        data: {
          orderId: orderId || null,
          template,
          recipient,
          status: EmailStatus.FAILED,
          sanitizedError: String(error?.message || error).slice(0, 500),
        },
      });
    } catch {
      // ignore db logging failure
    }
    return { success: false, status: EmailStatus.FAILED, error: "Internal email failure" };
  }
}
