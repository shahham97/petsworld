import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { verifyOrderAccessToken } from "@/actions/checkout-actions";
import { OrderVerificationForm } from "@/components/order/OrderVerificationForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CreditCard,
  MessageCircle,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderPageProps) {
  const { orderNumber } = await params;
  const { token } = await searchParams;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payment: true,
      history: {
        orderBy: { at: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Verify access token to prevent order enumeration
  let isAuthorized = false;
  if (token) {
    try {
      isAuthorized = await verifyOrderAccessToken(order.id, order.orderNumber, token);
    } catch {
      isAuthorized = false;
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Orders", href: "/order" },
    { label: order.orderNumber, href: `/order/${order.orderNumber}` },
  ];

  if (!isAuthorized) {
    return (
      <div className="bg-[#FFF8F0]/30 min-h-screen py-12 sm:py-16">
        <div className="max-w-xl mx-auto px-4 space-y-6">
          <OrderVerificationForm orderNumber={orderNumber} />
        </div>
      </div>
    );
  }

  const customer = order.customerSnapshot as any;
  const address = order.addressSnapshot as any;

  // Status badge styling
  const statusLabels: Record<string, { label: string; color: string; desc: string }> = {
    AWAITING_PAYMENT_VERIFICATION: {
      label: "Payment Submitted",
      color: "bg-amber-100 text-amber-900 border-amber-300",
      desc: "Our financial team is verifying your payment screenshot and TID. You will receive an SMS and email as soon as it is confirmed.",
    },
    CONFIRMED: {
      label: "Order Confirmed",
      color: "bg-emerald-100 text-emerald-900 border-emerald-300",
      desc: "Your order is confirmed and queued for fulfillment in our Lahore logistics center.",
    },
    PROCESSING: {
      label: "Packaging in Warehouse",
      color: "bg-blue-100 text-blue-900 border-blue-300",
      desc: "Items have been picked and packed securely with protective bubble cushioning.",
    },
    SHIPPED: {
      label: "Dispatched via Courier",
      color: "bg-purple-100 text-purple-900 border-purple-300",
      desc: order.trackingNumber
        ? `Handed over to ${order.courier || "Courier"}. Tracking Number: ${order.trackingNumber}`
        : "Handed over to our courier partner for express delivery.",
    },
    DELIVERED: {
      label: "Delivered",
      color: "bg-green-100 text-green-900 border-green-300",
      desc: "Parcel has been successfully delivered. Thank you for choosing PetsWorld!",
    },
    CANCELLED: {
      label: "Cancelled",
      color: "bg-red-100 text-red-900 border-red-300",
      desc: "This order has been cancelled.",
    },
  };

  const currentStatusInfo = statusLabels[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
    desc: "",
  };

  const whatsappMessage = encodeURIComponent(
    `Hi PetsWorld Support! I have a question regarding my order *${order.orderNumber}*.`
  );
  const whatsappUrl = `https://wa.me/923001234567?text=${whatsappMessage}`;

  return (
    <div className="bg-[#FFF8F0]/30 min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Celebration / Order Top Banner */}
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-4 shadow-xs text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              Order Placed Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight font-display">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-[#6B6560]">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-PK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Status Badge & Alert */}
          <div className={`p-4 rounded-2xl border text-left space-y-1 ${currentStatusInfo.color}`}>
            <div className="flex items-center justify-between font-bold text-xs">
              <span className="uppercase tracking-wider">Status: {currentStatusInfo.label}</span>
              <span className="text-[11px] font-normal">
                Payment: <strong className="font-bold">{order.paymentStatus}</strong>
              </span>
            </div>
            <p className="text-xs leading-relaxed">{currentStatusInfo.desc}</p>
          </div>
        </div>

        {/* Grid: Order Breakdown & Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Shipping Destination */}
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-3 text-xs shadow-xs">
            <h3 className="font-bold text-[#1F4D3A] uppercase tracking-wider pb-2 border-b border-[#E8D9CD]/60 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>Delivery Details</span>
            </h3>
            <p className="font-bold text-[#2B2622] text-sm">
              {customer?.firstName} {customer?.lastName}
            </p>
            <p className="text-[#6B6560]">{address?.addressLine1}</p>
            {address?.addressLine2 && <p className="text-[#6B6560]">{address?.addressLine2}</p>}
            <p className="text-[#6B6560]">
              {address?.city}, {address?.province} {address?.postalCode}
            </p>
            <div className="pt-2 border-t border-[#E8D9CD]/50 text-[#2B2622] space-y-0.5">
              <p>
                Mobile: <strong className="font-mono">{customer?.phone}</strong>
              </p>
              {customer?.email && <p>Email: {customer?.email}</p>}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-3 text-xs shadow-xs">
            <h3 className="font-bold text-[#1F4D3A] uppercase tracking-wider pb-2 border-b border-[#E8D9CD]/60 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>Payment Details</span>
            </h3>
            <p className="font-bold text-[#2B2622] text-sm">Method: {order.paymentMethod}</p>
            {order.payment && (
              <div className="space-y-1 text-[#6B6560]">
                {order.payment.normalizedTransactionId && (
                  <p>
                    Transaction ID (TID):{" "}
                    <strong className="font-mono text-[#2B2622]">
                      {order.payment.normalizedTransactionId}
                    </strong>
                  </p>
                )}
                {order.payment.normalizedRrn && (
                  <p>RRN: <strong className="font-mono text-[#2B2622]">{order.payment.normalizedRrn}</strong></p>
                )}
                <p>
                  Amount Declared:{" "}
                  <strong className="text-[#1F4D3A]">
                    Rs. {Number(order.payment.amountDeclared).toLocaleString("en-PK")}
                  </strong>
                </p>
                {order.payment.receiptAssetId && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                    ✓ Screenshot Securely Attached
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[#2B2622] font-display flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D98E3F]" />
            <span>Items Ordered</span>
          </h3>

          <div className="divide-y divide-[#E8D9CD] text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[#2B2622]">{item.nameSnapshot}</h4>
                  <p className="text-[11px] text-[#6B6560] font-mono">
                    SKU: {item.skuSnapshot} • Rs. {Number(item.unitPrice).toLocaleString("en-PK")} × {item.quantity}
                  </p>
                </div>
                <div className="font-bold text-[#1F4D3A] text-sm">
                  Rs. {Number(item.subtotal).toLocaleString("en-PK")}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8D9CD] space-y-2 text-xs">
            <div className="flex justify-between text-[#6B6560]">
              <span>Subtotal:</span>
              <span className="font-bold text-[#2B2622]">
                Rs. {Number(order.subtotal).toLocaleString("en-PK")}
              </span>
            </div>
            <div className="flex justify-between text-[#6B6560]">
              <span>Shipping Fee:</span>
              <span className="font-bold text-[#2B2622]">
                {Number(order.shippingFee) === 0 ? "FREE" : `Rs. ${Number(order.shippingFee).toLocaleString("en-PK")}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2B2622] pt-2 border-t border-[#E8D9CD]/60">
              <span>Total:</span>
              <span className="text-xl font-black text-[#1F4D3A]">
                Rs. {Number(order.total).toLocaleString("en-PK")}
              </span>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        {order.history.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#2B2622] font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D98E3F]" />
              <span>Order Tracking Timeline</span>
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8D9CD]">
              {order.history.map((h) => (
                <div key={h.id} className="relative flex items-start gap-4 pl-8 text-xs">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#1F4D3A] border-2 border-white ring-2 ring-[#1F4D3A]/20" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#2B2622]">{h.toStatus.replace(/_/g, " ")}</p>
                    {h.note && <p className="text-[#6B6560]">{h.note}</p>}
                    <p className="text-[10px] text-[#6B6560]/70">
                      {new Date(h.at).toLocaleDateString("en-PK", {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp Support CTA */}
        <div className="p-6 rounded-3xl bg-[#FFF8F0] border border-[#E8D9CD] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-sm text-[#2B2622]">Need Help with This Order?</h4>
            <p className="text-xs text-[#6B6560]">
              Our support team is ready on WhatsApp to assist with delivery updates or product inquiries.
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-colors shrink-0 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
