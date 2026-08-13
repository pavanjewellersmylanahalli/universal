import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

// In non-browser environments, use ws for WebSocket
if (typeof WebSocket === "undefined") {
  // Lazily require ws to avoid bundling issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require("ws");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("user:password@neon-host")) {
    const dummyAdapter = {
      provider: "postgres" as const,
      adapterName: "dummy",
      queryRaw: async () => {
        throw new Error("Database is not configured. Please set DATABASE_URL in your environment.");
      },
      executeRaw: async () => {
        throw new Error("Database is not configured. Please set DATABASE_URL in your environment.");
      },
      connect: async () => {
        return dummyAdapter as any;
      }
    };
    return new PrismaClient({
      adapter: dummyAdapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
