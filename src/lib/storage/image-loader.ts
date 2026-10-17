"use client";

/**
 * Custom Next.js image loader mapping requested widths to stored database variants.
 * Zero dependency on Vercel image optimization quota.
 */
export default function petsWorldImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  // Pass through external URLs, data URLs, static assets in /images/, or Next internal assets
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/images/") ||
    src.startsWith("/_next/") ||
    src.startsWith("data:") ||
    src.endsWith(".ico") ||
    src.endsWith(".png") && !src.startsWith("/media/")
  ) {
    return src;
  }

  // If not a /media/ path, return as is
  if (!src.startsWith("/media/")) {
    return src;
  }

  // Extract asset ID from /media/[assetId] or /media/[assetId]/[variant]
  const parts = src.split("/").filter(Boolean);
  const assetId = parts[1];
  if (!assetId) return src;

  // Map requested width to stored variant (thumb: 320, md: 800, lg: 1600)
  let variant = "thumb";
  if (width > 800) {
    variant = "lg";
  } else if (width > 320) {
    variant = "md";
  }

  return `/media/${assetId}/${variant}`;
}
