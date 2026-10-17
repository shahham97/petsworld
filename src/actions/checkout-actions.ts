"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/email";
import { handleServerError } from "@/lib/messages";
import { PaymentMethodCode, OrderStatus, PaymentStatus } from "@prisma/client";

const COOKIE_NAME = "pw_checkout_token";

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface CustomerInfoInput {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  province: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
}

export interface PaymentDataInput {
  method: PaymentMethodCode;
  transactionId?: string;
  senderMobile?: string;
  senderName?: string;
  senderBankName?: string;
  amountPaid?: number;
  paymentDateTime?: string;
  rrn?: string;
  stan?: string;
  receiptAssetId?: string;
}

/**
 * Generates an HMAC order verification token
 */
export async function generateOrderAccessToken(orderId: string, orderNumber: string): Promise<string> {
  const secret = process.env.AUTH_SECRET || "petsworld-secret-salt-2026";
  return crypto.createHmac("sha256", secret).update(`${orderId}:${orderNumber}`).digest("hex");
}

export async function verifyOrderAccessToken(orderId: string, orderNumber: string, token: string): Promise<boolean> {
  const expected = await generateOrderAccessToken(orderId, orderNumber);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

/**
 * Verify ownership by phone or email to prevent order enumeration
 */
export async function verifyOrderOwnershipAction(orderNumber: string, phoneOrEmail: string) {
  try {
    const cleanInput = phoneOrEmail.trim().toLowerCase().replace(/[\s-]/g, "");
    const order = await db.order.findUnique({
      where: { orderNumber },
      select: { id: true, orderNumber: true, customerSnapshot: true },
    });

    if (!order) return { success: false, error: "Order not found." };

    const customer = order.customerSnapshot as any;
    const cleanPhone = (customer.phone || "").replace(/[\s-]/g, "");
    const cleanEmail = (customer.email || "").toLowerCase().trim();

    const matches = cleanInput === cleanPhone || (cleanEmail && cleanInput === cleanEmail);
    if (!matches) {
      return { success: false, error: "Phone number or email does not match our records for this order." };
    }

    const token = await generateOrderAccessToken(order.id, order.orderNumber);
    return { success: true, token };
  } catch (error: any) {
    const safe = handleServerError(error, "VERIFY_ORDER");
    return { success: false, error: safe.error };
  }
}

/**
 * Sync cart items with database for live prices and stock levels
 */
export async function syncCartItemsAction(items: CartItemInput[]) {
  if (!items || items.length === 0) return { items: [], subtotal: 0, freeShippingThreshold: 3000, shippingFee: 200 };

  try {
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.product.findMany({
      where: {
        id: { in: productIds },
        isPublished: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    const storeSettings = await db.storeSettings.findUnique({ where: { id: "default" } });
    const flatFee = Number(storeSettings?.shippingFlatFee || 200);
    const freeThreshold = Number(storeSettings?.freeShippingThreshold || 3000);

    let subtotal = 0;
    const syncedItems = items
      .map((item) => {
        const prod = dbProducts.find((p) => p.id === item.productId);
        if (!prod) return null;

        const unitPrice = prod.salePrice ? Number(prod.salePrice) : Number(prod.price);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        return {
          productId: prod.id,
          name: prod.name,
          slug: prod.slug,
          brand: prod.brand,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
          stockQty: prod.stockQty,
          imageAssetId: prod.images[0]?.assetId || null,
        };
      })
      .filter(Boolean);

    const shippingFee = subtotal >= freeThreshold ? 0 : flatFee;

    return {
      items: syncedItems,
      subtotal,
      shippingFee,
      freeShippingThreshold: freeThreshold,
    };
  } catch (error: any) {
    console.error("syncCartItemsAction error:", error);
    return { items: [], subtotal: 0, freeShippingThreshold: 3000, shippingFee: 200 };
  }
}

/**
 * 1. Initialize or Refresh Checkout Session
 */
export async function initCheckoutSessionAction(items: CartItemInput[]) {
  if (!items || items.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  try {
    // 1. Fetch live product data from database (single source of truth)
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.product.findMany({
      where: {
        id: { in: productIds },
        isPublished: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    if (dbProducts.length !== items.length) {
      return { success: false, error: "One or more products in your cart are no longer available." };
    }

    const storeSettings = await db.storeSettings.findUnique({ where: { id: "default" } });
    const flatFee = Number(storeSettings?.shippingFlatFee || 200);
    const freeThreshold = Number(storeSettings?.freeShippingThreshold || 3000);

    let subtotal = 0;
    const validatedCartItems = items.map((item) => {
      const prod = dbProducts.find((p) => p.id === item.productId)!;
      if (prod.stockQty < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stockQty} remaining.`);
      }

      const unitPrice = prod.salePrice ? Number(prod.salePrice) : Number(prod.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        productId: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        unitPrice,
        quantity: item.quantity,
        subtotal: lineTotal,
        imageAssetId: prod.images[0]?.assetId || null,
        stockQty: prod.stockQty,
      };
    });

    const shippingFee = subtotal >= freeThreshold ? 0 : flatFee;
    const total = subtotal + shippingFee;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const idempotencyKey = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const cartSnapshot = {
      items: validatedCartItems,
      subtotal,
      shippingFee,
      total,
      freeShippingThreshold: freeThreshold,
    };

    const session = await db.checkoutSession.create({
      data: {
        tokenHash,
        cartSnapshot,
        completedSteps: 1,
        idempotencyKey,
        expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7200,
      path: "/",
    });

    return {
      success: true,
      session: {
        id: session.id,
        cartSnapshot,
        completedSteps: 1,
      },
    };
  } catch (error: any) {
    const safe = handleServerError(error, "INIT_CHECKOUT");
    return { success: false, error: safe.error };
  }
}

/**
 * 2. Get Active Checkout Session
 */
export async function getCheckoutSessionAction() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(COOKIE_NAME)?.value;
    if (!rawToken) return { success: false, error: "NO_SESSION" };

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const session = await db.checkoutSession.findUnique({
      where: { tokenHash },
    });

    if (!session || session.expiresAt < new Date()) {
      return { success: false, error: "EXPIRED" };
    }

    const rawPaymentMethods = await db.paymentMethod.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: "asc" },
    });

    const paymentMethods = rawPaymentMethods.map((m) => ({
      ...m,
      maxCodAmount: m.maxCodAmount ? Number(m.maxCodAmount) : null,
    }));

    const storeSettings = await db.storeSettings.findUnique({
      where: { id: "default" },
      select: {
        serviceableProvinces: true,
        serviceableCities: true,
        requireCustomerEmail: true,
      },
    });

    return {
      success: true,
      session: {
        id: session.id,
        cartSnapshot: session.cartSnapshot as any,
        customerInfo: session.customerInfo as any,
        paymentMethodCode: session.paymentMethodCode,
        paymentDetails: session.paymentDetails as any,
        receiptAssetId: session.receiptAssetId,
        completedSteps: session.completedSteps,
      },
      paymentMethods,
      storeSettings,
    };
  } catch (error: any) {
    const safe = handleServerError(error, "GET_CHECKOUT");
    return { success: false, error: safe.error };
  }
}

/**
 * 3. Save Customer & Delivery Info (Step 2)
 */
export async function saveCustomerInfoAction(rawInput: CustomerInfoInput) {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(COOKIE_NAME)?.value;
    if (!rawToken) return { success: false, error: "Session expired." };

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const session = await db.checkoutSession.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt < new Date()) return { success: false, error: "Session expired." };

    // Validate phone: 03XX XXXXXXX or 03XXXXXXXXX
    const cleanPhone = rawInput.phone.replace(/[\s-]/g, "");
    if (!/^03[0-9]{9}$/.test(cleanPhone)) {
      return { success: false, error: "Please enter a valid 11-digit Pakistani mobile number starting with 03 (e.g. 03001234567)." };
    }

    if (!rawInput.firstName.trim()) {
      return { success: false, error: "First name is required." };
    }

    if (!rawInput.addressLine1.trim()) {
      return { success: false, error: "Delivery address is required." };
    }

    if (!rawInput.province || !rawInput.city) {
      return { success: false, error: "Province and City are required." };
    }

    const customerInfo = {
      firstName: rawInput.firstName.trim(),
      lastName: rawInput.lastName?.trim() || "",
      phone: cleanPhone,
      email: rawInput.email?.trim() || null,
      province: rawInput.province.trim(),
      city: rawInput.city.trim(),
      addressLine1: rawInput.addressLine1.trim(),
      addressLine2: rawInput.addressLine2?.trim() || "",
      postalCode: rawInput.postalCode?.trim() || "",
    };

    await db.checkoutSession.update({
      where: { id: session.id },
      data: {
        customerInfo,
        completedSteps: Math.max(session.completedSteps, 2),
      },
    });

    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "SAVE_CUSTOMER_INFO");
    return { success: false, error: safe.error };
  }
}

/**
 * 4. Save Payment Method & Proof (Step 3)
 */
export async function savePaymentMethodAction(input: PaymentDataInput) {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(COOKIE_NAME)?.value;
    if (!rawToken) return { success: false, error: "Session expired." };

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const session = await db.checkoutSession.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt < new Date()) return { success: false, error: "Session expired." };

    const cart = session.cartSnapshot as any;
    const method = await db.paymentMethod.findUnique({ where: { code: input.method } });
    if (!method || !method.isEnabled) {
      return { success: false, error: "Selected payment method is currently unavailable." };
    }

    // COD check
    if (input.method === "COD") {
      if (method.maxCodAmount && cart.total > Number(method.maxCodAmount)) {
        return {
          success: false,
          error: `Cash on Delivery is only available for orders up to Rs. ${Number(method.maxCodAmount).toLocaleString("en-PK")}. Please choose Easypaisa, JazzCash, or Bank Transfer.`,
        };
      }

      await db.checkoutSession.update({
        where: { id: session.id },
        data: {
          paymentMethodCode: "COD",
          paymentDetails: {},
          receiptAssetId: null,
          completedSteps: Math.max(session.completedSteps, 3),
        },
      });

      return { success: true };
    }

    // Manual Payment Methods (Easypaisa, JazzCash, Bank Transfer)
    if (!input.transactionId || input.transactionId.trim().length < 6) {
      return { success: false, error: "A valid Transaction / Reference ID is required." };
    }

    const normalizedTid = input.transactionId.trim().toUpperCase();

    // Check duplicate TID
    const duplicate = await db.orderPayment.findFirst({
      where: {
        method: input.method,
        normalizedTransactionId: normalizedTid,
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "This Transaction ID has already been submitted for another order. Please check your SMS or app receipt.",
      };
    }

    if (method.requireReceipt && !input.receiptAssetId) {
      return { success: false, error: "Please upload your payment screenshot or transfer receipt." };
    }

    const paymentDetails = {
      transactionId: normalizedTid,
      senderMobile: input.senderMobile?.trim() || null,
      senderName: input.senderName?.trim() || null,
      senderBankName: input.senderBankName?.trim() || null,
      amountPaid: input.amountPaid || cart.total,
      paymentDateTime: input.paymentDateTime || new Date().toISOString(),
      rrn: input.rrn?.trim() || null,
      stan: input.stan?.trim() || null,
    };

    await db.checkoutSession.update({
      where: { id: session.id },
      data: {
        paymentMethodCode: input.method,
        paymentDetails,
        receiptAssetId: input.receiptAssetId || null,
        completedSteps: Math.max(session.completedSteps, 3),
      },
    });

    return { success: true };
  } catch (error: any) {
    const safe = handleServerError(error, "SAVE_PAYMENT");
    return { success: false, error: safe.error };
  }
}

/**
 * 5. Atomic Order Placement (Step 4)
 */
export async function placeOrderAction() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(COOKIE_NAME)?.value;
    if (!rawToken) return { success: false, error: "Session expired." };

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const session = await db.checkoutSession.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt < new Date()) {
      return { success: false, error: "Checkout session expired. Please restart checkout." };
    }

    if (session.completedSteps < 3 || !session.customerInfo || !session.paymentMethodCode) {
      return { success: false, error: "Please complete all checkout steps before submitting your order." };
    }

    const cart = session.cartSnapshot as any;
    const customer = session.customerInfo as any;
    const payment = (session.paymentDetails || {}) as any;
    const isCod = session.paymentMethodCode === "COD";

    // Format date string for order number (e.g. PW-20261016-8492)
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    const orderNumber = `PW-${datePart}-${randomHex}`;

    // Execute atomic transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Conditionally decrement stock with atomic check
      for (const item of cart.items) {
        const updateResult = await tx.$executeRaw`
          UPDATE Product
          SET stockQty = stockQty - ${item.quantity}
          WHERE id = ${item.productId} AND stockQty >= ${item.quantity}
        `;

        if (updateResult === 0) {
          throw new Error(`Insufficient stock for "${item.name}". Please return to cart and update quantity.`);
        }
      }

      // 2. Find or create Customer record
      let customerRecord = await tx.customer.findFirst({
        where: { phone: customer.phone },
      });

      if (!customerRecord) {
        customerRecord = await tx.customer.create({
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName || null,
            phone: customer.phone,
            email: customer.email || null,
          },
        });
      } else if (customer.email && !customerRecord.email) {
        customerRecord = await tx.customer.update({
          where: { id: customerRecord.id },
          data: { email: customer.email },
        });
      }

      // 3. Create Address record
      const addressRecord = await tx.address.create({
        data: {
          customerId: customerRecord.id,
          addressLine1: customer.addressLine1,
          addressLine2: customer.addressLine2 || null,
          city: customer.city,
          province: customer.province,
          postalCode: customer.postalCode || null,
        },
      });

      // 4. Create Order
      const initialStatus: OrderStatus = isCod
        ? OrderStatus.CONFIRMED
        : OrderStatus.AWAITING_PAYMENT_VERIFICATION;

      const initialPaymentStatus: PaymentStatus = isCod
        ? PaymentStatus.UNPAID
        : PaymentStatus.PENDING_VERIFICATION;

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerRecord.id,
          customerSnapshot: customer,
          addressSnapshot: addressRecord,
          subtotal: cart.subtotal,
          shippingFee: cart.shippingFee,
          total: cart.total,
          paymentMethod: session.paymentMethodCode!,
          paymentStatus: initialPaymentStatus,
          status: initialStatus,
          idempotencyKey: session.idempotencyKey || crypto.randomUUID(),
        },
      });

      // 5. Create OrderItems
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            nameSnapshot: item.name,
            skuSnapshot: item.sku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.subtotal,
          },
        });

        // 6. Record StockMovement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            delta: -item.quantity,
            reason: `ORDER_SALE:${orderNumber}`,
            orderId: newOrder.id,
          },
        });
      }

      // 7. If manual method, create OrderPayment and attach receipt
      if (!isCod) {
        await tx.orderPayment.create({
          data: {
            orderId: newOrder.id,
            method: session.paymentMethodCode!,
            details: payment,
            normalizedTransactionId: payment.transactionId || null,
            normalizedRrn: payment.rrn || null,
            receiptAssetId: session.receiptAssetId || null,
            amountDeclared: payment.amountPaid || cart.total,
          },
        });

        if (session.receiptAssetId) {
          await tx.mediaAsset.update({
            where: { id: session.receiptAssetId },
            data: {
              status: "ATTACHED",
              ownerType: "Order",
              ownerId: newOrder.id,
            },
          });
        }
      }

      // 8. Create Status History record
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: null,
          toStatus: initialStatus,
          note: isCod
            ? "Order placed with Cash on Delivery."
            : `Order placed. Payment submitted via ${session.paymentMethodCode}. Awaiting admin verification.`,
          changedBy: "Customer Checkout",
        },
      });

      // 9. Clean up checkout session
      await tx.checkoutSession.delete({
        where: { id: session.id },
      });

      return newOrder;
    });

    // Clear session cookie
    cookieStore.delete(COOKIE_NAME);

    // Generate access token for the thank you / tracking page
    const accessToken = await generateOrderAccessToken(order.id, order.orderNumber);

    // Send transactional confirmation email asynchronously
    if (customer.email) {
      sendTransactionalEmail({
        orderId: order.id,
        template: "order_confirmation",
        recipient: customer.email,
        subject: `Your PetsWorld Order ${order.orderNumber} is Confirmed!`,
        htmlContent: `
          <h1>Thank you for your order, ${customer.firstName}!</h1>
          <p>We've received your order <strong>${order.orderNumber}</strong> totaling <strong>Rs. ${Number(order.total).toLocaleString("en-PK")}</strong>.</p>
          <p>Payment Method: ${order.paymentMethod}</p>
          <p>We will update you as soon as your items are dispatched!</p>
        `,
      }).catch((e) => console.error("Async email error:", e));
    }

    return {
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      accessToken,
    };
  } catch (error: any) {
    const safe = handleServerError(error, "PLACE_ORDER");
    return { success: false, error: safe.error };
  }
}
