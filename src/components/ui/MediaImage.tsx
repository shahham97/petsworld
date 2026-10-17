"use client";

import React from "react";
import Image, { ImageProps } from "next/image";

interface MediaImageProps extends Omit<ImageProps, "src"> {
  src?: string;
  assetId?: string | null;
  blurDataUrl?: string | null;
  fallbackIcon?: React.ReactNode;
}

export function MediaImage({
  src,
  assetId,
  blurDataUrl,
  alt,
  className = "",
  fallbackIcon,
  priority = false,
  ...props
}: MediaImageProps) {
  const resolvedSrc = assetId ? `/media/${assetId}/thumb` : src;

  if (!resolvedSrc) {
    return (
      <div
        className={`bg-[#F4DFCB]/60 flex items-center justify-center text-[#6B6560] ${className}`}
        aria-label={alt || "Image placeholder"}
      >
        {fallbackIcon || <span className="text-xs font-semibold">No Image</span>}
      </div>
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt || "PetsWorld Product Image"}
      className={className}
      priority={priority}
      placeholder={blurDataUrl ? "blur" : "empty"}
      blurDataURL={blurDataUrl || undefined}
      {...props}
    />
  );
}
