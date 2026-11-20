import { defineConfig } from "prisma/config";

// DATABASE_URL is injected by Docker Compose. It is only required by the
// commands that reach the database (migrate, db seed), not by `prisma generate`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
