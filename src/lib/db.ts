import { PrismaClient } from "@prisma/client";

// Global declaration for singleton pattern in development to prevent connection exhaustion
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.error("FATAL: DATABASE_URL environment variable is missing.");
    throw new Error("DATABASE_URL is not set");
  }

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "stdout", level: "error" }],
  });

  if (process.env.NODE_ENV === "development") {
    // Log slow queries (> 200 ms) as specified in the project requirements
    client.$on("query" as never, (e: { query: string; params: string; duration: number }) => {
      if (e.duration >= 200) {
        console.warn(
          `\x1b[33m[SLOW QUERY]\x1b[0m ${e.duration}ms: ${e.query.slice(0, 150)}...`
        );
      }
    });
  }

  return client;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
