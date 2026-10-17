"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { compressImageOnClient } from "@/lib/storage/client-compress";
import { useToast } from "@/components/ui/Toast";
import { UploadCloud, Loader2 } from "lucide-react";

export function MediaUploadBox() {
  const [isUploading, setIsUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const toast = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Client-side canvas compression (max 2000px, quality 0.85)
      const compressedBlob = await compressImageOnClient(file, 2000, 0.85);

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name);
      formData.append("altText", altText.trim());
      formData.append("ownerType", "library");

      // 3. Post to /api/admin/media/upload
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Image processed and saved to database successfully.");
      setAltText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to upload image.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm">
      <h2 className="text-base font-bold text-[#2B2622] mb-3">Upload New Image Asset</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2">
          <label htmlFor="media-alt" className="block text-xs font-semibold text-[#6B6560] mb-1">
            Alt Text (Accessibility & SEO)
          </label>
          <input
            id="media-alt"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Royal Canin Kitten Food 2kg Bag"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9CD] text-sm text-[#2B2622] placeholder:text-[#6B6560]/60 focus:outline-none focus:ring-2 focus:ring-[#1F4D3A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B6560] mb-1">
            Select & Upload Image
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id="media-file-input"
          />
          <label
            htmlFor="media-file-input"
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer ${
              isUploading
                ? "bg-[#6B6560] cursor-not-allowed"
                : "bg-[#1F4D3A] hover:bg-[#163B2C] shadow-md shadow-[#1F4D3A]/15"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Compressing & Saving...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" aria-hidden="true" />
                <span>Choose Image</span>
              </>
            )}
          </label>
        </div>
      </div>
      <p className="text-[11px] text-[#6B6560] mt-2">
        Supports JPEG, PNG, WebP, and AVIF. Browser automatically resizes to max 2000px before uploading.
      </p>
    </div>
  );
}
