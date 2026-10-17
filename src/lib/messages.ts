/**
 * PetsWorld.pk Central Message Catalogue
 * 
 * Strict Security Rules:
 * - NEVER expose SQL/Prisma details, table names, system paths, or environment secrets.
 * - Server errors generate a short tracking code (e.g. PW-7K3F) for user support,
 *   with full details logged on the server.
 */

export function generateReferenceCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "PW-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const MESSAGES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: "Invalid email or password.",
  AUTH_REQUIRED: "Please sign in to access this section.",
  AUTH_LOGGED_OUT: "You have been signed out successfully.",
  AUTH_RATE_LIMITED: "Too many login attempts. Please wait a few minutes before trying again.",

  // Cart & Checkout
  CART_UPDATED: "Cart updated successfully.",
  CART_ITEM_REMOVED: "Item removed from your cart.",
  CART_EMPTY: "Your cart is currently empty.",
  CART_STOCK_EXCEEDED: "Requested quantity exceeds available stock.",
  CHECKOUT_STEP_INCOMPLETE: "Please complete the required information in the previous step first.",
  CHECKOUT_SESSION_EXPIRED: "Your checkout session has expired. Please review your cart to proceed.",
  CHECKOUT_CART_CHANGED: "Your cart items have changed. Please re-confirm your delivery details.",
  CHECKOUT_PAYMENT_METHOD_DISABLED: "The selected payment method is no longer available. Please choose another option.",
  CHECKOUT_ORDER_SUCCESS: "Thank you! Your order has been placed successfully.",
  CHECKOUT_COD_SUCCESS: "Your Cash on Delivery order is confirmed and is being prepared.",
  CHECKOUT_VERIFICATION_REQUIRED: "Your order is received and will be confirmed once payment verification is complete.",

  // Payment Verification
  PAYMENT_REFERENCE_REUSED: "This transaction ID or reference has already been submitted. Please check your receipt or contact support.",
  PAYMENT_AMOUNT_MISMATCH: "The entered payment amount does not match your order total.",
  PAYMENT_DATE_INVALID: "Payment date cannot be in the future or older than 72 hours.",
  PAYMENT_RECEIPT_REQUIRED: "Please upload a clear screenshot or photo of your payment receipt.",
  PAYMENT_RECEIPT_INVALID_TYPE: "Only JPEG, PNG, or WebP images are allowed.",
  PAYMENT_RECEIPT_TOO_LARGE: "The image file is too large. Please upload an image under 5 MB.",

  // Reviews
  REVIEW_SUBMITTED: "Thank you! Your review has been submitted for moderation.",
  REVIEW_RATE_LIMITED: "You have submitted multiple reviews recently. Please wait a short while.",

  // Contact Form
  CONTACT_SUBMITTED: "Thank you for reaching out! Our team will respond to your inquiry shortly.",
  CONTACT_RATE_LIMITED: "Please wait a moment before sending another message.",

  // Admin Mutations
  ADMIN_SAVED_SUCCESS: "Changes saved successfully.",
  ADMIN_DELETED_SUCCESS: "Item deleted successfully.",
  ADMIN_VERIFIED_SUCCESS: "Payment verified and order confirmed.",
  ADMIN_REJECTED_SUCCESS: "Payment marked as rejected.",
  ADMIN_EMAIL_SENT: "Test email sent successfully.",

  // Generic & Fallback
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
  NOT_FOUND: "The requested page or item could not be found.",
} as const;

export interface SafeActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  referenceCode?: string;
}

/**
 * Server-safe error logger and formatter
 */
export function handleServerError(error: unknown, contextDescription: string): SafeActionResponse<never> {
  const referenceCode = generateReferenceCode();
  
  // Log full error details strictly on the server
  console.error(`[SERVER_ERROR][${referenceCode}][${contextDescription}]:`, error);

  return {
    success: false,
    error: `Something went wrong. Please try again. (Reference: ${referenceCode})`,
    referenceCode,
  };
}
