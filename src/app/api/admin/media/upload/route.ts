import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, checkRateLimit } from "@/lib/auth";
import { storage } from "@/lib/storage/db-storage";
import { handleServerError } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Verify admin session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Rate limit uploads
  if (!checkRateLimit(`upload_admin_${session.id}`, 30, 60 * 1000)) {
    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || "";
    const caption = (formData.get("caption") as string) || "";
    const ownerType = (formData.get("ownerType") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Limit incoming request buffer size (max 4.5 MB server guard)
    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file exceeds the 4.5 MB upload limit." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save asset through storage pipeline
    const asset = await storage.saveAsset({
      buffer,
      visibility: "PUBLIC",
      ownerType,
      altText,
      caption,
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        caption: asset.caption,
        blurDataUrl: asset.blurDataUrl,
        byteSize: asset.byteSize,
        url: `/media/${asset.id}/lg`,
        thumbUrl: `/media/${asset.id}/thumb`,
      },
    });
  } catch (error) {
    const safeError = handleServerError(error, "ADMIN_MEDIA_UPLOAD");
    return NextResponse.json({ error: safeError.error }, { status: 500 });
  }
}
