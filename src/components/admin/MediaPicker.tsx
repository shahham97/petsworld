"use client";

import React, { useState, useEffect } from "react";
import { compressImageOnClient } from "@/lib/storage/client-compress";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import {
  Check,
  X,
  Loader2,
  Image as ImageIcon,
  Plus,
} from "lucide-react";

export interface MediaPickerAsset {
  id: string;
  url: string;
  thumbUrl: string;
  altText?: string | null;
  width: number;
  height: number;
}

interface MediaPickerProps {
  onSelect: (asset: MediaPickerAsset) => void;
  selectedAssetId?: string | null;
  buttonLabel?: string;
}

export function MediaPicker({
  onSelect,
  selectedAssetId,
  buttonLabel = "Choose Image",
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assets, setAssets] = useState<MediaPickerAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [altInput, setAltInput] = useState("");
  const toast = useToast();

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media/list");
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImageOnClient(file, 2000, 0.85);
      const fd = new FormData();
      fd.append("file", compressed, file.name);
      fd.append("altText", altInput.trim());
      fd.append("ownerType", "picker");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success("Image uploaded successfully.");
      onSelect(data.asset);
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] hover:bg-[#FFF8F0] hover:border-[#1F4D3A] transition-all cursor-pointer shadow-sm"
      >
        <ImageIcon className="w-4 h-4 text-[#D98E3F]" aria-hidden="true" />
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E8D9CD] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8D9CD] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2B2622]">Media Asset Picker</h3>
                <p className="text-xs text-[#6B6560]">
                  Select an existing media asset from TiDB or upload a new one
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-[#6B6560] hover:text-[#2B2622] hover:bg-[#F4DFCB]/40"
                aria-label="Close picker"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Upload Strip */}
            <div className="p-4 bg-[#FFF8F0] border-b border-[#E8D9CD] flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Image alt text (optional)"
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-xl border border-[#E8D9CD] bg-white text-[#2B2622]"
              />
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F4D3A] text-white text-xs font-bold hover:bg-[#163B2C] cursor-pointer transition-colors shadow-sm">
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Upload New</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={isUploading}
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Asset Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#6B6560] gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1F4D3A]" aria-hidden="true" />
                  <span className="text-xs font-medium">Loading database assets...</span>
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-16 text-[#6B6560] text-sm">
                  No public images found. Upload your first image above.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {assets.map((asset) => {
                    const isSelected = selectedAssetId === asset.id;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          onSelect(asset);
                          setIsOpen(false);
                        }}
                        className={`group relative aspect-square rounded-2xl overflow-hidden border-2 text-left transition-all ${
                          isSelected
                            ? "border-[#1F4D3A] ring-2 ring-[#1F4D3A]/30"
                            : "border-[#E8D9CD] hover:border-[#1F4D3A]"
                        }`}
                      >
                        <Image
                          src={asset.thumbUrl}
                          alt={asset.altText || "Media option"}
                          fill
                          unoptimized
                          sizes="150px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1F4D3A] text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                          {asset.altText || `${asset.width}x${asset.height}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
