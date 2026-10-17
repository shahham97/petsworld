import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assets = await db.mediaAsset.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        width: true,
        height: true,
        altText: true,
      },
    });

    const formatted = assets.map((a) => ({
      id: a.id,
      url: `/media/${a.id}/lg`,
      thumbUrl: `/media/${a.id}/thumb`,
      altText: a.altText,
      width: a.width,
      height: a.height,
    }));

    return NextResponse.json({ assets: formatted });
  } catch (error) {
    console.error("[ADMIN_MEDIA_LIST_ERROR]:", error);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}
