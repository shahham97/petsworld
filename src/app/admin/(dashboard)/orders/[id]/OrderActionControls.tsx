"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  verifyPaymentAction,
  rejectPaymentAction,
  markCodCollectedAction,
  updateOrderStatusAction,
  cancelOrderAction,
} from "@/actions/order-actions";
import { useToast } from "@/components/ui/Toast";
import {
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Ban,
  Loader2,
  ZoomIn,
  X,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { OrderStatus, PaymentStatus, PaymentMethodCode } from "@prisma/client";

interface OrderActionProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethodCode;
    courier?: string | null;
    trackingNumber?: string | null;
    payment?: {
      receiptAssetId?: string | null;
      normalizedTransactionId?: string | null;
    } | null;
  };
}

export function OrderActionControls({ order }: OrderActionProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [showShipModal, setShowShipModal] = useState(false);
  const [courier, setCourier] = useState(order.courier || "TCS Express");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [zoomReceipt, setZoomReceipt] = useState(false);

  // 1. Verify Payment
  const handleVerifyPayment = () => {
    if (!confirm(`Are you sure you want to verify payment for order ${order.orderNumber}?`)) return;

    startTransition(async () => {
      const res = await verifyPaymentAction(order.id);
      if (res.success) {
        toast.success("Payment verified. Order status updated to CONFIRMED.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to verify payment.");
      }
    });
  };

  // 2. Reject Payment
  const handleRejectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await rejectPaymentAction(order.id, rejectReason);
      if (res.success) {
        toast.success("Payment rejected.");
        setShowRejectModal(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reject payment.");
      }
    });
  };

  // 3. Mark COD Collected
  const handleCodCollected = () => {
    startTransition(async () => {
      const res = await markCodCollectedAction(order.id);
      if (res.success) {
        toast.success("COD payment marked as PAID.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update payment.");
      }
    });
  };

  // 4. Update status to Processing
  const handleSetProcessing = () => {
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, "PROCESSING");
      if (res.success) {
        toast.success("Order status updated to PROCESSING.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    });
  };

  // 5. Update status to Shipped
  const handleShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, "SHIPPED", courier, trackingNumber);
      if (res.success) {
        toast.success("Order marked as SHIPPED.");
        setShowShipModal(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to mark shipped.");
      }
    });
  };

  // 6. Update status to Delivered
  const handleSetDelivered = () => {
    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, "DELIVERED");
      if (res.success) {
        toast.success("Order marked as DELIVERED.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    });
  };

  // 7. Cancel Order
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await cancelOrderAction(order.id, cancelReason);
      if (res.success) {
        toast.success("Order cancelled and item inventory restored.");
        setShowCancelModal(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to cancel order.");
      }
    });
  };

  const isManualPayment = order.paymentMethod !== "COD";
  const needsPaymentVerification =
    isManualPayment &&
    (order.paymentStatus === "PENDING_VERIFICATION" || order.status === "AWAITING_PAYMENT_VERIFICATION");

  return (
    <div className="space-y-6">
      {/* Receipt Preview Box (if manual payment) */}
      {order.payment?.receiptAssetId && (
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8D9CD]">
            <h3 className="text-xs font-bold text-[#1F4D3A] uppercase tracking-wider">
              Payment Screenshot / Receipt
            </h3>
            <button
              type="button"
              onClick={() => setZoomReceipt(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D98E3F] hover:underline cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Full Resolution</span>
            </button>
          </div>

          <div
            onClick={() => setZoomReceipt(true)}
            className="relative aspect-[3/4] max-w-xs mx-auto rounded-2xl overflow-hidden border border-[#E8D9CD] bg-[#FFF8F0] cursor-zoom-in group shadow-xs"
          >
            <Image
              src={`/api/admin/receipts/${order.payment.receiptAssetId}`}
              alt="Payment proof"
              fill
              unoptimized
              className="object-contain group-hover:scale-102 transition-transform"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
              <ZoomIn className="w-4 h-4" />
              <span>Click to Zoom</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Controls Card */}
      <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-[#2B2622] uppercase tracking-wider pb-2 border-b border-[#E8D9CD]">
          Administrative Actions
        </h3>

        <div className="flex flex-col gap-2.5">
          {/* Payment Verification Buttons */}
          {needsPaymentVerification && (
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#E8D9CD]">
              <button
                type="button"
                disabled={isPending}
                onClick={handleVerifyPayment}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify Payment</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowRejectModal(true)}
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Proof</span>
              </button>
            </div>
          )}

          {/* COD Mark Paid */}
          {order.paymentMethod === "COD" && order.paymentStatus !== "PAID" && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleCodCollected}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              <span>Mark Cash Collected (Paid)</span>
            </button>
          )}

          {/* Status Progression */}
          {order.status === "CONFIRMED" && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSetProcessing}
              className="py-2.5 px-4 rounded-xl bg-[#1F4D3A] hover:bg-[#163B2C] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>Mark as Processing in Warehouse</span>
            </button>
          )}

          {(order.status === "CONFIRMED" || order.status === "PROCESSING") && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowShipModal(true)}
              className="py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch via Courier (Ship)</span>
            </button>
          )}

          {order.status === "SHIPPED" && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSetDelivered}
              className="py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Delivered</span>
            </button>
          )}

          {/* Cancel Order */}
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowCancelModal(true)}
              className="py-2.5 px-4 rounded-xl border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Order (Restores Stock)</span>
            </button>
          )}
        </div>
      </div>

      {/* Zoom Receipt Modal */}
      {zoomReceipt && order.payment?.receiptAssetId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-3xl overflow-hidden p-4 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomReceipt(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={`/api/admin/receipts/${order.payment.receiptAssetId}`}
                alt="Full receipt"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectPaymentSubmit}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#E8D9CD]"
          >
            <h3 className="text-base font-bold text-[#2B2622]">Reject Payment Proof</h3>
            <p className="text-xs text-[#6B6560]">
              Provide a clear reason (e.g. invalid TID, amount mismatch, blurry screenshot). The customer will be informed.
            </p>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Transaction ID was not found on our bank statement or amount was short."
              className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dispatch / Courier Modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleShipSubmit}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#E8D9CD]"
          >
            <h3 className="text-base font-bold text-[#2B2622]">Dispatch Order via Courier</h3>
            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Courier Service Name
              </label>
              <input
                type="text"
                required
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="e.g. TCS Express, Leopard, Trax, Call Courier"
                className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 7829104928"
                className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShipModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
              >
                Confirm Dispatch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCancelSubmit}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-[#E8D9CD]"
          >
            <h3 className="text-base font-bold text-[#2B2622]">Cancel Order</h3>
            <p className="text-xs text-[#6B6560]">
              Cancelling will atomically restore all reserved item quantities back into available inventory.
            </p>
            <textarea
              required
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation / unreachable on phone."
              className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Confirm Cancel & Restore
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
