import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { createPrismaClient } from "./lib/prisma.js";

const env = loadEnv();
const prisma = createPrismaClient(env.DATABASE_URL);
const app = createApp({ prisma, jwtSecret: env.JWT_SECRET });

const server = app.listen(env.PORT, (error) => {
  if (error) {
    console.error("Failed to start the HTTP server.", error);
    process.exit(1);
  }
  console.info(`EventHub API listening on port ${env.PORT} (docs: /docs)`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.info(`${signal} received, shutting down.`);
  server.close(() => {
    prisma
      .$disconnect()
      .catch((error: unknown) => {
        console.error("Failed to disconnect from the database.", error);
      })
      .finally(() => process.exit(0));
  });
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
