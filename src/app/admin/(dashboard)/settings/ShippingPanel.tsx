"use client";

import React, { useState, useTransition } from "react";
import { saveShippingSettingsAction } from "@/actions/settings-actions";
import { useToast } from "@/components/ui/Toast";
import { Save, Loader2, Plus, X } from "lucide-react";

export function ShippingPanel({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const [flatFee, setFlatFee] = useState<number>(Number(settings?.shippingFlatFee || 200));
  const [freeThreshold, setFreeThreshold] = useState<number>(Number(settings?.freeShippingThreshold || 3000));
  const [provinces, setProvinces] = useState<string[]>(
    Array.isArray(settings?.serviceableProvinces)
      ? settings.serviceableProvinces
      : ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Islamabad Capital Territory", "Balochistan"]
  );
  const [cities, setCities] = useState<string[]>(
    Array.isArray(settings?.serviceableCities)
      ? settings.serviceableCities
      : ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"]
  );

  const [newCity, setNewCity] = useState("");

  const handleAddCity = () => {
    if (!newCity.trim()) return;
    if (!cities.includes(newCity.trim())) {
      setCities([...cities, newCity.trim()]);
    }
    setNewCity("");
  };

  const handleRemoveCity = (city: string) => {
    setCities(cities.filter((c) => c !== city));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveShippingSettingsAction({
        shippingFlatFee: flatFee,
        freeShippingThreshold: freeThreshold,
        serviceableProvinces: provinces,
        serviceableCities: cities,
      });
      if (res.success) {
        toast.success("Shipping rules saved successfully.");
      } else {
        toast.error(res.error || "Failed to save shipping rules.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8D9CD]">
        <div>
          <h2 className="text-base font-bold text-[#2B2622]">Shipping Rates & Serviceable Pakistan Cities</h2>
          <p className="text-xs text-[#6B6560]">Set nationwide delivery charges and serviceable delivery coverage</p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Standard Delivery Fee (PKR)
          </label>
          <input
            type="number"
            min="0"
            required
            value={flatFee}
            onChange={(e) => setFlatFee(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm font-semibold text-[#2B2622]"
          />
          <span className="text-[11px] text-[#6B6560] mt-1 block">Default flat shipping fee charged per order</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#2B2622] mb-1">
            Free Shipping Threshold (PKR)
          </label>
          <input
            type="number"
            min="0"
            required
            value={freeThreshold}
            onChange={(e) => setFreeThreshold(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm font-semibold text-[#1F4D3A]"
          />
          <span className="text-[11px] text-[#6B6560] mt-1 block">Orders equal or exceeding this total get free shipping</span>
        </div>
      </div>

      {/* Serviceable Cities Tags */}
      <div className="pt-4 border-t border-[#E8D9CD] space-y-4">
        <label className="text-xs font-bold uppercase text-[#2B2622] block">
          Serviceable Cities ({cities.length})
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCity();
              }
            }}
            placeholder="Add new city (e.g. Hyderabad, Bahawalpur)..."
            className="flex-1 px-4 py-2 rounded-xl border border-[#E8D9CD] text-xs text-[#2B2622]"
          />
          <button
            type="button"
            onClick={handleAddCity}
            className="px-4 py-2 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] hover:bg-[#F4DFCB]/60 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add City</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD]">
          {cities.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E8D9CD] text-xs font-semibold text-[#2B2622]"
            >
              <span>{city}</span>
              <button
                type="button"
                onClick={() => handleRemoveCity(city)}
                className="text-[#6B6560] hover:text-[#DC2626]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </form>
  );
}
