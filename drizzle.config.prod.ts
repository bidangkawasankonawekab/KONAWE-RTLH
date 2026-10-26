import { defineConfig } from "drizzle-kit";

/**
 * Konfigurasi Drizzle untuk migrasi ke database PRODUKSI.
 * Membaca DATABASE_URL dari environment (drizzle-kit otomatis memuat .env).
 *
 * Pemakaian:
 *   DATABASE_URL="postgresql://..." npx drizzle-kit push --config drizzle.config.prod.ts
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
