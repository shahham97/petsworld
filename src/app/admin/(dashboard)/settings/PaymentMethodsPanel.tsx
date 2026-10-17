"use client";

import React, { useState, useTransition } from "react";
import { savePaymentMethodAction } from "@/actions/settings-actions";
import { useToast } from "@/components/ui/Toast";
import { Save, Loader2, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { PaymentMethodCode } from "@prisma/client";

export function PaymentMethodsPanel({ paymentMethods }: { paymentMethods: any[] }) {
  const [methods, setMethods] = useState(paymentMethods);
  const [activeCode, setActiveCode] = useState<PaymentMethodCode>(paymentMethods[0]?.code || "COD");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const currentMethod = methods.find((m) => m.code === activeCode) || methods[0];

  const handleUpdateCurrent = (field: string, value: any) => {
    setMethods((prev) =>
      prev.map((m) => (m.code === activeCode ? { ...m, [field]: value } : m))
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await savePaymentMethodAction({
        code: currentMethod.code,
        label: currentMethod.label,
        isEnabled: currentMethod.isEnabled,
        sortOrder: currentMethod.sortOrder,
        instructions: currentMethod.instructions,
        accountTitle: currentMethod.accountTitle,
        accountNumber: currentMethod.accountNumber,
        bankName: currentMethod.bankName,
        iban: currentMethod.iban,
        branch: currentMethod.branch,
        maxCodAmount: currentMethod.maxCodAmount ? Number(currentMethod.maxCodAmount) : null,
        requireReceipt: currentMethod.requireReceipt,
        fields: currentMethod.fields,
      });

      if (res.success) {
        toast.success(`${currentMethod.label} settings saved.`);
      } else {
        toast.error(res.error || "Failed to save payment method.");
      }
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h2 className="text-base font-bold text-[#2B2622]">Payment Methods & Manual Proof Verification</h2>
          <p className="text-xs text-[#6B6560]">Configure payment accounts, instructions, and customer verification forms</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Current Method</span>
        </button>
      </div>

      {/* Method Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {methods.map((m) => (
          <button
            key={m.code}
            type="button"
            onClick={() => setActiveCode(m.code)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCode === m.code
                ? "bg-[#FFF8F0] border-[#1F4D3A] ring-2 ring-[#1F4D3A]/20"
                : "border-[#E8D9CD] hover:border-[#1F4D3A]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                m.isEnabled ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F3F4F6] text-[#6B7280]"
              }`}>
                {m.isEnabled ? "Enabled" : "Disabled"}
              </span>
              <span className="text-[10px] font-mono text-[#6B6560]">#{m.sortOrder}</span>
            </div>
            <span className="text-sm font-bold text-[#2B2622] block truncate">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Editor for Selected Method */}
      <div className="space-y-6 pt-4 border-t border-[#E8D9CD]">
        {/* Toggle & Label */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
              Method Label
            </label>
            <input
              type="text"
              value={currentMethod.label}
              onChange={(e) => handleUpdateCurrent("label", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={currentMethod.sortOrder}
              onChange={(e) => handleUpdateCurrent("sortOrder", parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="method-enabled"
              checked={currentMethod.isEnabled}
              onChange={(e) => handleUpdateCurrent("isEnabled", e.target.checked)}
              className="w-4 h-4 rounded text-[#1F4D3A]"
            />
            <label htmlFor="method-enabled" className="text-sm font-semibold text-[#2B2622]">
              Enabled at Checkout
            </label>
          </div>
        </div>

        {/* Customer Instructions */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Customer Instructions (Rendered at Checkout Step 3)
          </label>
          <textarea
            rows={3}
            value={currentMethod.instructions || ""}
            onChange={(e) => handleUpdateCurrent("instructions", e.target.value)}
            placeholder="Instructions displayed in the payment box..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
          />
        </div>

        {/* Account Details specific to Wallets / Bank */}
        {currentMethod.code === "COD" ? (
          <div>
            <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
              Maximum COD Amount Allowed (PKR)
            </label>
            <input
              type="number"
              value={currentMethod.maxCodAmount || 25000}
              onChange={(e) => handleUpdateCurrent("maxCodAmount", parseFloat(e.target.value) || 0)}
              className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622]"
            />
            <span className="text-[11px] text-[#6B6560] mt-1 block">Orders above this limit will require online transfer</span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] space-y-4">
            <h3 className="text-xs font-bold uppercase text-[#D98E3F]">
              Official Receiving Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B6560] mb-1">
                  Account Title *
                </label>
                <input
                  type="text"
                  value={currentMethod.accountTitle || ""}
                  onChange={(e) => handleUpdateCurrent("accountTitle", e.target.value)}
                  placeholder="e.g. PetsWorld Payments"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B6560] mb-1">
                  Account Number / Mobile Wallet Number *
                </label>
                <input
                  type="text"
                  value={currentMethod.accountNumber || ""}
                  onChange={(e) => handleUpdateCurrent("accountNumber", e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622] font-mono"
                />
              </div>

              {currentMethod.code === "BANK_TRANSFER" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B6560] mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={currentMethod.bankName || ""}
                      onChange={(e) => handleUpdateCurrent("bankName", e.target.value)}
                      placeholder="e.g. Meezan Bank Limited"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B6560] mb-1">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={currentMethod.iban || ""}
                      onChange={(e) => handleUpdateCurrent("iban", e.target.value)}
                      placeholder="PK36MEZN..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B6560] mb-1">
                      Branch Name / Code
                    </label>
                    <input
                      type="text"
                      value={currentMethod.branch || ""}
                      onChange={(e) => handleUpdateCurrent("branch", e.target.value)}
                      placeholder="e.g. DHA Phase 5 Branch, Lahore"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8D9CD] bg-white text-xs text-[#2B2622]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="req-receipt"
                checked={currentMethod.requireReceipt}
                onChange={(e) => handleUpdateCurrent("requireReceipt", e.target.checked)}
                className="w-4 h-4 rounded text-[#1F4D3A]"
              />
              <label htmlFor="req-receipt" className="text-xs font-bold text-[#1F4D3A]">
                Require Customer Payment Screenshot / Slip Upload (Stored as PRIVATE asset)
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
