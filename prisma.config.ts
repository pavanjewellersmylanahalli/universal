import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import("@prisma/adapter-neon");
      const { neonConfig, Pool } = await import("@neondatabase/serverless");

      if (typeof WebSocket === "undefined") {
        const ws = await import("ws");
        neonConfig.webSocketConstructor = ws.default;
      }

      const pool = new Pool({
        connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
      });
      return new PrismaNeon(pool);
    },
  },
});
