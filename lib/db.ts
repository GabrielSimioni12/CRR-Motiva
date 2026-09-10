import { neon } from "@neondatabase/serverless";

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não configurada (.env.local ou Vercel)");
  }
  return neon(process.env.DATABASE_URL);
}