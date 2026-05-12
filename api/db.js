import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

export async function ensureTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS entries (
      date      DATE PRIMARY KEY,
      ciro      NUMERIC(15,2) NOT NULL,
      sales     INTEGER NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      month_key  VARCHAR(7) PRIMARY KEY,
      ciro_goal  NUMERIC(15,2) NOT NULL DEFAULT 0,
      sales_goal INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
