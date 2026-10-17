import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    // Verify database connectivity
    await db.$queryRawUnsafe("SELECT 1");
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          latencyMs,
          provider: "TiDB Serverless",
        },
        uptimeSeconds: Math.floor(process.uptime()),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const refCode = `PW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Detailed server-only error logging
    console.error(`[HEALTH CHECK FAILED][${refCode}] Latency: ${latencyMs}ms. Error:`, error);

    return NextResponse.json(
      {
        status: "unhealthy",
        referenceCode: refCode,
        message: "Database connection failed or timed out.",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
