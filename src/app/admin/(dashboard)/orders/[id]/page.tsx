import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { OrderActionControls } from "./OrderActionControls";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Package,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
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

  const customer = order.customerSnapshot as any;
  const address = order.addressSnapshot as any;
  const paymentDetails = (order.payment?.details || {}) as any;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-2xl border border-[#E8D9CD] bg-white text-[#6B6560] hover:text-[#1F4D3A] hover:bg-[#FFF8F0]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#2B2622] font-display">
                {order.orderNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1F4D3A]/10 text-[#1F4D3A]">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-[#6B6560] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString("en-PK")}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#6B6560] block">Total Amount</span>
          <span className="text-2xl font-black text-[#1F4D3A]">
            Rs. {Number(order.total).toLocaleString("en-PK")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Customer, Address, Items, Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer & Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl border border-[#E8D9CD] p-5 space-y-2 text-xs shadow-xs">
              <h3 className="font-bold text-[#1F4D3A] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E8D9CD]/60">
                <User className="w-4 h-4" />
                <span>Customer Information</span>
              </h3>
              <p className="font-bold text-[#2B2622] text-sm">
                {customer?.firstName} {customer?.lastName}
              </p>
              <p className="font-mono text-[#2B2622]">Phone: {customer?.phone}</p>
              {customer?.email && <p className="text-[#6B6560]">Email: {customer?.email}</p>}
            </div>

            <div className="bg-white rounded-3xl border border-[#E8D9CD] p-5 space-y-2 text-xs shadow-xs">
              <h3 className="font-bold text-[#1F4D3A] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E8D9CD]/60">
                <MapPin className="w-4 h-4" />
                <span>Shipping Destination</span>
              </h3>
              <p className="text-[#2B2622] font-medium">{address?.addressLine1}</p>
              {address?.addressLine2 && <p className="text-[#6B6560]">{address?.addressLine2}</p>}
              <p className="font-semibold text-[#1F4D3A]">
                {address?.city}, {address?.province} {address?.postalCode}
              </p>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-5 space-y-3 text-xs shadow-xs">
            <h3 className="font-bold text-[#1F4D3A] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#E8D9CD]/60">
              <CreditCard className="w-4 h-4" />
              <span>Payment Details & Reconciliation</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-[#6B6560] uppercase block">Method</span>
                <span className="font-bold text-[#2B2622]">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6560] uppercase block">Payment Status</span>
                <span
                  className={`font-bold uppercase ${
                    order.paymentStatus === "PAID"
                      ? "text-emerald-700"
                      : order.paymentStatus === "FAILED"
                      ? "text-red-700"
                      : "text-amber-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6560] uppercase block">Declared Amount</span>
                <span className="font-bold text-[#1F4D3A]">
                  Rs. {order.payment?.amountDeclared ? Number(order.payment.amountDeclared).toLocaleString("en-PK") : Number(order.total).toLocaleString("en-PK")}
                </span>
              </div>
              {order.payment?.normalizedTransactionId && (
                <div>
                  <span className="text-[10px] text-[#6B6560] uppercase block">Transaction ID (TID)</span>
                  <span className="font-mono font-bold text-[#2B2622]">
                    {order.payment.normalizedTransactionId}
                  </span>
                </div>
              )}
              {paymentDetails?.senderName && (
                <div>
                  <span className="text-[10px] text-[#6B6560] uppercase block">Sender Name</span>
                  <span className="font-bold text-[#2B2622]">{paymentDetails.senderName}</span>
                </div>
              )}
              {paymentDetails?.senderMobile && (
                <div>
                  <span className="text-[10px] text-[#6B6560] uppercase block">Sender Mobile / Bank</span>
                  <span className="font-bold text-[#2B2622]">{paymentDetails.senderMobile}</span>
                </div>
              )}
            </div>

            {order.payment?.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <strong>Rejection Reason:</strong> {order.payment.rejectionReason}
              </div>
            )}
          </div>

          {/* Ordered Items Table */}
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-[#2B2622] font-display flex items-center gap-1.5 pb-2 border-b border-[#E8D9CD]">
              <Package className="w-4 h-4 text-[#D98E3F]" />
              <span>Ordered Products ({order.items.length})</span>
            </h3>

            <div className="divide-y divide-[#E8D9CD] text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-[#2B2622]">{item.nameSnapshot}</h4>
                    <span className="text-[11px] font-mono text-[#6B6560]">
                      SKU: {item.skuSnapshot} • Rs. {Number(item.unitPrice).toLocaleString("en-PK")} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-black text-[#1F4D3A] text-sm">
                    Rs. {Number(item.subtotal).toLocaleString("en-PK")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8D9CD] space-y-1.5 text-xs">
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
              <div className="flex justify-between text-sm font-bold text-[#2B2622] pt-2 border-t border-[#E8D9CD]/60">
                <span>Total:</span>
                <span className="text-xl font-black text-[#1F4D3A]">
                  Rs. {Number(order.total).toLocaleString("en-PK")}
                </span>
              </div>
            </div>
          </div>

          {/* Status History Timeline */}
          <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-[#2B2622] font-display flex items-center gap-1.5 pb-2 border-b border-[#E8D9CD]">
              <Calendar className="w-4 h-4 text-[#D98E3F]" />
              <span>Audit History & Status Milestones</span>
            </h3>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8D9CD]">
              {order.history.map((h) => (
                <div key={h.id} className="relative flex items-start gap-4 pl-8 text-xs">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#1F4D3A] border-2 border-white ring-2 ring-[#1F4D3A]/20" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#2B2622]">{h.toStatus.replace(/_/g, " ")}</p>
                    {h.note && <p className="text-[#6B6560]">{h.note}</p>}
                    <p className="text-[10px] text-[#6B6560]/70">
                      By {h.changedBy} on{" "}
                      {new Date(h.at).toLocaleDateString("en-PK", {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Admin Action Controls & Receipt Preview */}
        <div className="lg:col-span-4">
          <OrderActionControls
            order={{
              id: order.id,
              orderNumber: order.orderNumber,
              status: order.status,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              courier: order.courier,
              trackingNumber: order.trackingNumber,
              payment: order.payment
                ? {
                    receiptAssetId: order.payment.receiptAssetId,
                    normalizedTransactionId: order.payment.normalizedTransactionId,
                  }
                : null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
