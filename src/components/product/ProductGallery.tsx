"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  assetId: string;
  altText: string | null;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = images[selectedIndex];
  const activeUrl = activeImage
    ? `/media/${activeImage.assetId}/lg`
    : "/images/hero-pets.webp";

  return (
    <div className="space-y-4 select-none">
      {/* Main Image Container */}
      <div
        className="relative aspect-square w-full rounded-3xl bg-white border border-[#E8D9CD] overflow-hidden group shadow-sm"
        style={{ position: "relative" }}
      >
        <Image
          src={activeUrl}
          alt={activeImage?.altText || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Lightbox Trigger Icon */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/90 border border-[#E8D9CD] text-[#1F4D3A] shadow-md hover:bg-white hover:scale-110 transition-all cursor-pointer"
          aria-label="Enlarge product image"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.assetId}
              type="button"
              onClick={() => setSelectedIndex(i)}
              style={{ position: "relative" }}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                selectedIndex === i
                  ? "border-[#1F4D3A] ring-2 ring-[#1F4D3A]/20 scale-95"
                  : "border-[#E8D9CD] hover:border-[#1F4D3A]/60 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={`/media/${img.assetId}/thumb`}
                alt={img.altText || `${productName} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close zoom modal"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full h-[85vh] flex items-center justify-center">
            <Image
              src={activeUrl}
              alt={productName}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
