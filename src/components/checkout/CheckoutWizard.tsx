"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import {
  saveCustomerInfoAction,
  savePaymentMethodAction,
  placeOrderAction,
  CustomerInfoInput,
  PaymentDataInput,
} from "@/actions/checkout-actions";
import { useToast } from "@/components/ui/Toast";
import {
  CheckCircle,
  Truck,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Copy,
  UploadCloud,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { PaymentMethodCode } from "@prisma/client";

interface CheckoutWizardProps {
  initialSession: any;
  paymentMethods: any[];
  storeSettings: any;
}

export function CheckoutWizard({
  initialSession,
  paymentMethods,
  storeSettings,
}: CheckoutWizardProps) {
  const router = useRouter();
  const toast = useToast();
  const { clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<number>(initialSession.completedSteps || 1);
  const [completedSteps, setCompletedSteps] = useState<number>(initialSession.completedSteps || 1);
  const [cartSnapshot, setCartSnapshot] = useState(initialSession.cartSnapshot);
  const [isPending, startTransition] = useTransition();

  // Step 2 state
  const [customerForm, setCustomerForm] = useState<CustomerInfoInput>({
    firstName: initialSession.customerInfo?.firstName || "",
    lastName: initialSession.customerInfo?.lastName || "",
    phone: initialSession.customerInfo?.phone || "",
    email: initialSession.customerInfo?.email || "",
    province:
      initialSession.customerInfo?.province ||
      (storeSettings?.serviceableProvinces?.[0] as string) ||
      "Punjab",
    city: initialSession.customerInfo?.city || "Lahore",
    addressLine1: initialSession.customerInfo?.addressLine1 || "",
    addressLine2: initialSession.customerInfo?.addressLine2 || "",
    postalCode: initialSession.customerInfo?.postalCode || "",
  });

  // Step 3 state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodCode>(
    initialSession.paymentMethodCode || "COD"
  );
  const [paymentForm, setPaymentForm] = useState({
    transactionId: initialSession.paymentDetails?.transactionId || "",
    senderMobile: initialSession.paymentDetails?.senderMobile || "",
    senderName: initialSession.paymentDetails?.senderName || "",
    senderBankName: initialSession.paymentDetails?.senderBankName || "",
    amountPaid: initialSession.paymentDetails?.amountPaid || cartSnapshot.total,
    rrn: initialSession.paymentDetails?.rrn || "",
    stan: initialSession.paymentDetails?.stan || "",
    receiptAssetId: initialSession.receiptAssetId || "",
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const provinces =
    (storeSettings?.serviceableProvinces as string[]) || [
      "Punjab",
      "Sindh",
      "Khyber Pakhtunkhwa",
      "Islamabad Capital Territory",
      "Balochistan",
    ];

  const cities =
    (storeSettings?.serviceableCities as string[]) || [
      "Lahore",
      "Karachi",
      "Islamabad",
      "Rawalpindi",
      "Faisalabad",
      "Multan",
      "Peshawar",
      "Quetta",
      "Sialkot",
      "Gujranwala",
    ];

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Step 1: Confirm Cart
  const handleStep1Complete = () => {
    setCompletedSteps((prev) => Math.max(prev, 2));
    setCurrentStep(2);
  };

  // Step 2: Submit Customer Information
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await saveCustomerInfoAction(customerForm);
      if (res.success) {
        setCompletedSteps((prev) => Math.max(prev, 3));
        setCurrentStep(3);
        toast.success("Delivery details saved.");
      } else {
        setErrorMessage(res.error || "Failed to save customer details.");
      }
    });
  };

  // Handle Receipt File Upload
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      toast.error("Receipt file must be under 4.5 MB.");
      return;
    }

    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setIsUploadingReceipt(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/checkout/receipt/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentForm((prev) => ({ ...prev, receiptAssetId: data.assetId }));
        toast.success("Payment receipt uploaded successfully.");
      } else {
        toast.error(data.error || "Failed to upload receipt.");
        setReceiptFile(null);
        setReceiptPreview(null);
      }
    } catch {
      toast.error("Network error while uploading receipt.");
      setReceiptFile(null);
      setReceiptPreview(null);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Step 3: Submit Payment Details
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const activeMethodObj = paymentMethods.find((m) => m.code === selectedMethod);
    if (activeMethodObj?.requireReceipt && !paymentForm.receiptAssetId) {
      setErrorMessage("Please upload your payment screenshot or transfer receipt.");
      return;
    }

    startTransition(async () => {
      const res = await savePaymentMethodAction({
        method: selectedMethod,
        ...paymentForm,
      });

      if (res.success) {
        setCompletedSteps((prev) => Math.max(prev, 4));
        setCurrentStep(4);
        toast.success("Payment method verified.");
      } else {
        setErrorMessage(res.error || "Failed to save payment.");
      }
    });
  };

  // Step 4: Final Order Placement
  const handlePlaceOrder = () => {
    setErrorMessage(null);
    startTransition(async () => {
      const res = await placeOrderAction();
      if (res.success && res.orderNumber) {
        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/order/${res.orderNumber}?token=${res.accessToken}`);
      } else {
        setErrorMessage(res.error || "Failed to place order.");
      }
    });
  };

  const activeMethod = paymentMethods.find((m) => m.code === selectedMethod);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* 4-Step Progress Indicator */}
      <nav aria-label="Checkout Steps" className="bg-white rounded-3xl border border-[#E8D9CD] p-3 sm:p-6 shadow-xs">
        <ol className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs">
          {[
            { step: 1, label: "Cart Review", icon: Truck },
            { step: 2, label: "Delivery", icon: Truck },
            { step: 3, label: "Payment", icon: CreditCard },
            { step: 4, label: "Confirm", icon: FileCheck },
          ].map(({ step, label, icon: Icon }) => {
            const isCompleted = completedSteps >= step;
            const isCurrent = currentStep === step;

            return (
              <li
                key={step}
                onClick={() => {
                  if (completedSteps >= step) setCurrentStep(step);
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 px-1 sm:px-3 rounded-2xl transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#1F4D3A] text-white font-bold shadow-xs"
                    : isCompleted
                    ? "text-[#1F4D3A] font-semibold hover:bg-[#FFF8F0]"
                    : "text-[#6B6560]/40 pointer-events-none"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                    isCurrent
                      ? "bg-white text-[#1F4D3A] font-black"
                      : isCompleted
                      ? "bg-[#1F4D3A]/10 text-[#1F4D3A] font-bold"
                      : "bg-[#E8D9CD]/50 text-[#6B6560]"
                  }`}
                >
                  {isCompleted && !isCurrent ? "✓" : step}
                </div>
                <span className="truncate">{label}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: CART REVIEW */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-[#2B2622] font-display">
              Step 1: Review Order Items
            </h2>
            <p className="text-xs text-[#6B6560] mt-1">
              Confirm your products and verified prices before proceeding to delivery
            </p>
          </div>

          <div className="divide-y divide-[#E8D9CD]">
            {cartSnapshot.items.map((item: any) => (
              <div key={item.productId} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] overflow-hidden shrink-0">
                    <Image
                      src={item.imageAssetId ? `/media/${item.imageAssetId}/thumb` : "/images/hero-pets.webp"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2B2622] line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-[#6B6560]">
                      Rs. {item.unitPrice.toLocaleString("en-PK")} × {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-black text-[#1F4D3A]">
                  Rs. {item.subtotal.toLocaleString("en-PK")}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8D9CD] space-y-2 text-xs">
            <div className="flex justify-between text-[#6B6560]">
              <span>Subtotal:</span>
              <span className="font-bold text-[#2B2622]">
                Rs. {cartSnapshot.subtotal.toLocaleString("en-PK")}
              </span>
            </div>
            <div className="flex justify-between text-[#6B6560]">
              <span>Shipping Fee:</span>
              <span className="font-bold text-[#2B2622]">
                {cartSnapshot.shippingFee === 0 ? "FREE" : `Rs. ${cartSnapshot.shippingFee.toLocaleString("en-PK")}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#2B2622] pt-2 border-t border-[#E8D9CD]/50">
              <span>Order Total:</span>
              <span className="text-base font-black text-[#1F4D3A]">
                Rs. {cartSnapshot.total.toLocaleString("en-PK")}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8D9CD]">
            <Link
              href="/cart"
              className="px-5 py-2.5 rounded-2xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560] hover:bg-[#FFF8F0]"
            >
              Modify Cart
            </Link>
            <button
              type="button"
              onClick={handleStep1Complete}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 cursor-pointer"
            >
              <span>Continue to Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DELIVERY INFO */}
      {currentStep === 2 && (
        <form onSubmit={handleStep2Submit} className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-[#2B2622] font-display">
              Step 2: Customer & Delivery Address
            </h2>
            <p className="text-xs text-[#6B6560] mt-1">
              Enter your Pakistani contact number and delivery destination
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={customerForm.firstName}
                onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                placeholder="e.g. Ali"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={customerForm.lastName}
                onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                placeholder="e.g. Khan"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Pakistani Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                placeholder="03001234567"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622] font-mono"
              />
              <span className="text-[10px] text-[#6B6560] mt-0.5 block">
                Format: 11 digits starting with 03 (e.g. 03001234567)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Email Address {storeSettings?.requireCustomerEmail ? "*" : "(Optional)"}
              </label>
              <input
                type="email"
                required={storeSettings?.requireCustomerEmail}
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                placeholder="ali@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Province *
              </label>
              <select
                required
                value={customerForm.province}
                onChange={(e) => setCustomerForm({ ...customerForm, province: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622] bg-white font-medium"
              >
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                City *
              </label>
              <input
                type="text"
                required
                list="city-options"
                value={customerForm.city}
                onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
              <datalist id="city-options">
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Street Address / House / Flat *
              </label>
              <input
                type="text"
                required
                value={customerForm.addressLine1}
                onChange={(e) => setCustomerForm({ ...customerForm, addressLine1: e.target.value })}
                placeholder="e.g. House 42, Street 5, Sector Y, Phase 3, DHA"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Nearby Landmark / Floor (Optional)
              </label>
              <input
                type="text"
                value={customerForm.addressLine2}
                onChange={(e) => setCustomerForm({ ...customerForm, addressLine2: e.target.value })}
                placeholder="Near Jamia Mosque"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                Postal Code (Optional)
              </label>
              <input
                type="text"
                value={customerForm.postalCode}
                onChange={(e) => setCustomerForm({ ...customerForm, postalCode: e.target.value })}
                placeholder="e.g. 54000"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#E8D9CD]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560] hover:bg-[#FFF8F0]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: PAYMENT METHOD & PROOF */}
      {currentStep === 3 && (
        <form onSubmit={handleStep3Submit} className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-[#2B2622] font-display">
              Step 3: Select Payment Method & Submit Proof
            </h2>
            <p className="text-xs text-[#6B6560] mt-1">
              Choose Cash on Delivery or transfer via Easypaisa, JazzCash, or Online Bank Transfer
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {paymentMethods.map((m) => {
              const isSelected = selectedMethod === m.code;
              return (
                <div
                  key={m.code}
                  onClick={() => setSelectedMethod(m.code)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#1F4D3A] bg-[#FFF8F0]/80 shadow-xs"
                      : "border-[#E8D9CD] hover:border-[#D98E3F]/40 bg-white"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-[#2B2622] block">{m.label}</span>
                    <span className="text-[11px] text-[#6B6560] block">
                      {m.code === "COD" ? "Pay in cash at your doorstep" : "Instant mobile/bank transfer"}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-[#1F4D3A] bg-[#1F4D3A]" : "border-[#E8D9CD]"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* If COD */}
          {selectedMethod === "COD" && (
            <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1F4D3A]">
                <Truck className="w-4 h-4" />
                <span>Cash on Delivery Selected</span>
              </div>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Please prepare the exact cash amount of{" "}
                <strong className="font-bold text-[#2B2622]">
                  Rs. {cartSnapshot.total.toLocaleString("en-PK")}
                </strong>{" "}
                upon delivery. Our courier will collect payment before handing over the parcel.
              </p>
            </div>
          )}

          {/* If Manual Payment Method (Easypaisa, JazzCash, Bank Transfer) */}
          {selectedMethod !== "COD" && activeMethod && (
            <div className="space-y-6 pt-2">
              {/* Account Info Box with 1-click Copy */}
              <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8D9CD]/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
                    Official {activeMethod.label} Account Details
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#D98E3F]">
                    <span>Exact Total:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(cartSnapshot.total), "Order Total")}
                      className="inline-flex items-center gap-1 font-mono hover:underline cursor-pointer"
                    >
                      <span>Rs. {cartSnapshot.total.toLocaleString("en-PK")}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {activeMethod.accountTitle && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8D9CD]">
                      <div>
                        <span className="text-[10px] text-[#6B6560] block uppercase">Account Title</span>
                        <span className="font-bold text-[#2B2622]">{activeMethod.accountTitle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeMethod.accountTitle!, "Account Title")}
                        className="p-1 text-[#6B6560] hover:text-[#1F4D3A] cursor-pointer"
                        title="Copy Account Title"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {activeMethod.accountNumber && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8D9CD]">
                      <div>
                        <span className="text-[10px] text-[#6B6560] block uppercase">Account / Mobile Number</span>
                        <span className="font-bold font-mono text-[#2B2622]">{activeMethod.accountNumber}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeMethod.accountNumber!, "Account Number")}
                        className="p-1 text-[#6B6560] hover:text-[#1F4D3A] cursor-pointer"
                        title="Copy Account Number"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {activeMethod.bankName && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8D9CD]">
                      <div>
                        <span className="text-[10px] text-[#6B6560] block uppercase">Bank Name</span>
                        <span className="font-bold text-[#2B2622]">{activeMethod.bankName}</span>
                      </div>
                    </div>
                  )}

                  {activeMethod.iban && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8D9CD]">
                      <div>
                        <span className="text-[10px] text-[#6B6560] block uppercase">IBAN</span>
                        <span className="font-bold font-mono text-[11px] text-[#2B2622]">{activeMethod.iban}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeMethod.iban!, "IBAN")}
                        className="p-1 text-[#6B6560] hover:text-[#1F4D3A] cursor-pointer"
                        title="Copy IBAN"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {activeMethod.instructions && (
                  <p className="text-[11px] text-[#6B6560] leading-relaxed">
                    {activeMethod.instructions}
                  </p>
                )}
              </div>

              {/* Payment Proof Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#2B2622] uppercase tracking-wider">
                  Payment Confirmation Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                      Transaction / Reference ID (TID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                      placeholder="e.g. 1928374652"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs font-mono font-bold text-[#2B2622]"
                    />
                    <span className="text-[10px] text-[#6B6560] mt-0.5 block">
                      Found in SMS or transfer confirmation slip
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                      Sender Account Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.senderName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, senderName: e.target.value })}
                      placeholder="Title on your wallet/bank"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                      Sender Mobile / Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.senderMobile || paymentForm.senderBankName}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          senderMobile: e.target.value,
                          senderBankName: e.target.value,
                        })
                      }
                      placeholder="e.g. 03001234567 or Meezan Bank"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2B2622] uppercase mb-1">
                      Amount Paid (PKR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={paymentForm.amountPaid}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-xs font-mono font-bold text-[#2B2622]"
                    />
                  </div>
                </div>

                {/* Receipt Upload Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#2B2622] uppercase">
                    Upload Transfer Screenshot / Receipt {activeMethod.requireReceipt ? "*" : "(Optional)"}
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-[#E8D9CD] bg-[#FFF8F0]/40">
                    {receiptPreview ? (
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#E8D9CD] shrink-0 bg-white">
                        <Image
                          src={receiptPreview}
                          alt="Receipt Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center shrink-0 text-[#1F4D3A]">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                    )}

                    <div className="space-y-1.5 text-center sm:text-left flex-1">
                      <input
                        type="file"
                        id="receipt-file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="receipt-file"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] hover:bg-[#FFF8F0] shadow-2xs cursor-pointer"
                      >
                        {isUploadingReceipt ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading & Processing...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{receiptPreview ? "Replace Screenshot" : "Choose Image (JPEG, PNG, WebP)"}</span>
                          </>
                        )}
                      </label>
                      <p className="text-[10px] text-[#6B6560]">
                        Encrypted as Private asset. Accessible only to verified store administrators. Max 4.5 MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-[#E8D9CD]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560] hover:bg-[#FFF8F0]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Address</span>
            </button>
            <button
              type="submit"
              disabled={isPending || isUploadingReceipt}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Review Final Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: REVIEW & PLACE ORDER */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-[#E8D9CD] p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-[#2B2622] font-display">
              Step 4: Final Review & Confirmation
            </h2>
            <p className="text-xs text-[#6B6560] mt-1">
              Please double check all details before submitting your order
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Destination Card */}
            <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8D9CD]/60">
                <span className="font-bold text-[#1F4D3A] uppercase tracking-wider">
                  Delivery Destination
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-[11px] font-bold text-[#D98E3F] hover:underline"
                >
                  Edit
                </button>
              </div>
              <p className="font-bold text-[#2B2622]">
                {customerForm.firstName} {customerForm.lastName}
              </p>
              <p className="text-[#6B6560]">{customerForm.addressLine1}</p>
              {customerForm.addressLine2 && <p className="text-[#6B6560]">{customerForm.addressLine2}</p>}
              <p className="text-[#6B6560]">
                {customerForm.city}, {customerForm.province} {customerForm.postalCode}
              </p>
              <p className="font-mono text-[#2B2622] pt-1">Phone: {customerForm.phone}</p>
            </div>

            {/* Payment Method Card */}
            <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8D9CD]/60">
                <span className="font-bold text-[#1F4D3A] uppercase tracking-wider">
                  Payment Method
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-[11px] font-bold text-[#D98E3F] hover:underline"
                >
                  Edit
                </button>
              </div>
              <p className="font-bold text-[#2B2622]">{activeMethod?.label}</p>
              {selectedMethod === "COD" ? (
                <p className="text-[#6B6560]">Payment due upon parcel delivery.</p>
              ) : (
                <div className="space-y-1 text-[#6B6560]">
                  <p>
                    TID: <strong className="font-mono text-[#2B2622]">{paymentForm.transactionId}</strong>
                  </p>
                  <p>Sender: {paymentForm.senderName}</p>
                  <p className="text-[11px] text-[#1F4D3A] font-semibold">
                    ✓ Payment proof screenshot attached
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#2B2622] uppercase tracking-wider">
              Order Items ({cartSnapshot.items.length})
            </h3>
            <div className="divide-y divide-[#E8D9CD] border border-[#E8D9CD] rounded-2xl overflow-hidden bg-white">
              {cartSnapshot.items.map((item: any) => (
                <div key={item.productId} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#1F4D3A]">{item.quantity}×</span>
                    <span className="text-[#2B2622] font-medium line-clamp-1">{item.name}</span>
                  </div>
                  <span className="font-black text-[#2B2622]">
                    Rs. {item.subtotal.toLocaleString("en-PK")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] space-y-2 text-xs">
            <div className="flex justify-between text-[#6B6560]">
              <span>Subtotal:</span>
              <span className="font-bold text-[#2B2622]">
                Rs. {cartSnapshot.subtotal.toLocaleString("en-PK")}
              </span>
            </div>
            <div className="flex justify-between text-[#6B6560]">
              <span>Delivery Fee:</span>
              <span className="font-bold text-[#2B2622]">
                {cartSnapshot.shippingFee === 0 ? "FREE" : `Rs. ${cartSnapshot.shippingFee.toLocaleString("en-PK")}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2B2622] pt-2 border-t border-[#E8D9CD]/60">
              <span>Total Payable:</span>
              <span className="text-xl font-black text-[#1F4D3A]">
                Rs. {cartSnapshot.total.toLocaleString("en-PK")}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#E8D9CD]">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#E8D9CD] text-xs font-bold text-[#6B6560] hover:bg-[#FFF8F0]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Payment</span>
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handlePlaceOrder}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1F4D3A] text-white text-sm font-extrabold hover:bg-[#163B2C] shadow-lg shadow-[#1F4D3A]/25 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order & Decrementing Stock...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order (Rs. {cartSnapshot.total.toLocaleString("en-PK")})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
