import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { storage } from "@/lib/storage/db-storage";
import { MediaVariantName } from "@/lib/storage/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  // 1. Enforce Server-Side Admin Authentication
  const session = await getAdminSession();
  if (!session) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  }

  const { assetId } = await params;
  const { searchParams } = new URL(request.url);
  const variant = (searchParams.get("variant") as MediaVariantName) || "lg";

  try {
    const result = await storage.getReceipt(assetId, variant);
    if (!result) {
      return new NextResponse("Receipt not found", {
        status: 404,
        headers: {
          "Cache-Control": "private, no-store",
        },
      });
    }

    return new NextResponse(new Uint8Array(result.data), {
      status: 200,
      headers: {
        "Content-Type": result.mimeType || "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(`[RECEIPT_FETCH_ERROR][${assetId}]:`, error);
    return new NextResponse("Unable to fetch receipt", {
      status: 500,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  }
}
