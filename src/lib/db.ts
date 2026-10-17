import { PrismaClient } from "@prisma/client";

// Global declaration for singleton pattern in development to prevent connection exhaustion
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getNormalizedDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || "";
  if (!url) {
    console.error("FATAL: DATABASE_URL environment variable is missing.");
    throw new Error("DATABASE_URL is not set");
  }

  // Ensure SSL parameters required by TiDB Cloud Serverless are present
  // TiDB Cloud prohibits unencrypted transport: ERROR HY000 (1105): Connections using insecure transport are prohibited
  if (!url.includes("sslaccept=") && !url.includes("sslmode=")) {
    const delimiter = url.includes("?") ? "&" : "?";
    url = `${url}${delimiter}sslaccept=strict`;
  }

  // Ensure reasonable connection timeouts and pool limits for serverless execution
  if (!url.includes("connect_timeout=")) {
    const delimiter = url.includes("?") ? "&" : "?";
    url = `${url}${delimiter}connect_timeout=30`;
  }

  // Update process.env so any Prisma internal engines inherit the secure URL
  process.env.DATABASE_URL = url;
  return url;
}

function createPrismaClient(): PrismaClient {
  const secureUrl = getNormalizedDatabaseUrl();

  const client = new PrismaClient({
    datasourceUrl: secureUrl,
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
