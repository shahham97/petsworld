import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage/db-storage";
import { MediaVariantName } from "@/lib/storage/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_VARIANTS: Record<string, boolean> = {
  thumb: true,
  md: true,
  lg: true,
  og: true,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string; variant: string }> }
) {
  const { assetId, variant } = await params;

  if (!VALID_VARIANTS[variant]) {
    return new NextResponse("Invalid image variant requested", { status: 400 });
  }

  try {
    const result = await storage.getVariant(assetId, variant as MediaVariantName);

    if (!result) {
      return new NextResponse("Image not found or not public", { status: 404 });
    }

    const etag = `W/"${result.sha256}-${variant}"`;

    // Check If-None-Match header for CDN / browser cache validation
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: etag,
        },
      });
    }

    return new NextResponse(new Uint8Array(result.data), {
      status: 200,
      headers: {
        "Content-Type": result.mimeType || "image/webp",
        "Content-Length": result.data.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(`[MEDIA_SERVE_ERROR][${assetId}][${variant}]:`, error);
    return new NextResponse("Error serving media", { status: 500 });
  }
}
