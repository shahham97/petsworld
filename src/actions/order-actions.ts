"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { handleServerError } from "@/lib/messages";
import { OrderStatus, PaymentStatus } from "@prisma/client";

/**
 * 1. Verify Payment for Wallet/Bank Transfer
 */
export async function verifyPaymentAction(orderId: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) return { success: false, error: "Order not found." };

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
        },
      });

      if (order.payment) {
        await tx.orderPayment.update({
          where: { id: order.payment.id },
          data: {
            verifiedByAdminId: session.id,
            verifiedAt: new Date(),
            rejectionReason: null,
          },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.CONFIRMED,
          note: `Payment verified by admin (${session.email}).`,
          changedBy: `Admin: ${session.name || session.email}`,
        },
      });
    });

    const customer = order.customerSnapshot as any;
    if (customer?.email) {
      sendTransactionalEmail({
        orderId,
        template: "payment_verified",
        recipient: customer.email,
        subject: `Payment Verified for Order ${order.orderNumber}`,
        htmlContent: `<p>Great news! We have verified your payment for order <strong>${order.orderNumber}</strong>. Your items are now being prepared for shipping.</p>`,
      }).catch(console.error);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "VERIFY_PAYMENT");
    return { success: false, error: safe.error };
  }
}

/**
 * 2. Reject Payment
 */
export async function rejectPaymentAction(orderId: string, reason: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (!reason.trim()) return { success: false, error: "Rejection reason is required." };

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) return { success: false, error: "Order not found." };

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      if (order.payment) {
        await tx.orderPayment.update({
          where: { id: order.payment.id },
          data: {
            rejectionReason: reason.trim(),
          },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: order.status,
          note: `Payment rejected by admin (${session.email}). Reason: ${reason.trim()}`,
          changedBy: `Admin: ${session.name || session.email}`,
        },
      });
    });

    const customer = order.customerSnapshot as any;
    if (customer?.email) {
      sendTransactionalEmail({
        orderId,
        template: "payment_rejected",
        recipient: customer.email,
        subject: `Payment Verification Issue for Order ${order.orderNumber}`,
        htmlContent: `<p>Hello ${customer.firstName},</p><p>We could not verify your payment for order <strong>${order.orderNumber}</strong>. Reason: ${reason.trim()}.</p><p>Please reply or contact us on WhatsApp so we can resolve this promptly.</p>`,
      }).catch(console.error);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "REJECT_PAYMENT");
    return { success: false, error: safe.error };
  }
}

/**
 * 3. Mark Cash Collected for COD
 */
export async function markCodCollectedAction(orderId: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: "Order not found." };

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: order.status,
          note: `COD payment marked as collected by admin (${session.email}).`,
          changedBy: `Admin: ${session.name || session.email}`,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "COLLECT_COD");
    return { success: false, error: safe.error };
  }
}

/**
 * 4. Update Order Status (Processing, Shipped, Delivered)
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  courier?: string,
  trackingNumber?: string
) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: "Order not found." };

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          courier: courier || order.courier,
          trackingNumber: trackingNumber || order.trackingNumber,
        },
      });

      let note = `Order status updated to ${newStatus.replace(/_/g, " ")}.`;
      if (newStatus === "SHIPPED" && trackingNumber) {
        note += ` Dispatched via ${courier || "Courier"} (Tracking: ${trackingNumber}).`;
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: newStatus,
          note,
          changedBy: `Admin: ${session.name || session.email}`,
        },
      });
    });

    const customer = order.customerSnapshot as any;
    if (customer?.email) {
      sendTransactionalEmail({
        orderId,
        template: `order_${newStatus.toLowerCase()}`,
        recipient: customer.email,
        subject: `Update on your PetsWorld Order ${order.orderNumber}: ${newStatus.replace(/_/g, " ")}`,
        htmlContent: `<p>Your order <strong>${order.orderNumber}</strong> is now <strong>${newStatus.replace(/_/g, " ")}</strong>.</p>`,
      }).catch(console.error);
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "UPDATE_STATUS");
    return { success: false, error: safe.error };
  }
}

/**
 * 5. Cancel Order and Restore Stock
 */
export async function cancelOrderAction(orderId: string, reason: string) {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return { success: false, error: "Order not found." };
    if (order.status === "CANCELLED") return { success: false, error: "Order is already cancelled." };

    await db.$transaction(async (tx) => {
      // 1. Update Order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      // 2. Restore stock for each item
      for (const item of order.items) {
        if (item.productId) {
          await tx.$executeRaw`
            UPDATE Product
            SET stockQty = stockQty + ${item.quantity}
            WHERE id = ${item.productId}
          `;

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              delta: item.quantity,
              reason: `RESTORE_CANCELLED_ORDER:${order.orderNumber}`,
              orderId: order.id,
            },
          });
        }
      }

      // 3. Log Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          note: `Order cancelled. Stock restored. Reason: ${reason || "Cancelled by admin"}`,
          changedBy: `Admin: ${session.name || session.email}`,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "CANCEL_ORDER");
    return { success: false, error: safe.error };
  }
}
