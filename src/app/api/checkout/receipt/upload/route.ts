import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage/db-storage";
import { handleServerError } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("pw_checkout_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Active checkout session required." }, { status: 401 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await db.checkoutSession.findUnique({
      where: { tokenHash },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Checkout session expired. Please restart checkout." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No receipt screenshot provided." }, { status: 400 });
    }

    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: "Receipt image exceeds 4.5 MB limit." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save as PRIVATE, TEMP asset linked to this checkout session
    const asset = await storage.saveAsset({
      buffer,
      visibility: "PRIVATE",
      ownerType: "OrderReceipt",
      checkoutSessionId: session.id,
      altText: "Customer payment receipt",
    });

    // Update checkout session with receiptAssetId
    await db.checkoutSession.update({
      where: { id: session.id },
      data: { receiptAssetId: asset.id },
    });

    return NextResponse.json({
      success: true,
      assetId: asset.id,
    });
  } catch (error: any) {
    const safeError = handleServerError(error, "RECEIPT_UPLOAD");
    return NextResponse.json({ error: safeError.error }, { status: 500 });
  }
}
