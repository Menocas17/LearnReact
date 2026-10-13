import { defineConfig } from "drizzle-kit";

// `pnpm db:generate` crea las migraciones SQL en ./drizzle.
// `pnpm db:migrate` las aplica a DATABASE_URL (Postgres real, p. ej. Neon).
// En local sin DATABASE_URL, la app aplica las migraciones a PGlite al arrancar.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
