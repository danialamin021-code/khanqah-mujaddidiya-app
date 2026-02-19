/**
 * Concatenates all Supabase migrations into scripts/apply-migrations.sql
 * Run: npx tsx scripts/concat-migrations.ts
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const migrationsDir = join(process.cwd(), "supabase", "migrations");
const outPath = join(process.cwd(), "scripts", "apply-migrations.sql");

const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
const parts: string[] = [
  "-- Combined migrations for Supabase",
  "-- Run in Dashboard → SQL Editor → New query",
  "-- https://supabase.com/dashboard/project/_/sql",
  "--",
];

for (const f of files) {
  parts.push(`\n-- ========== ${f} ==========`);
  parts.push(readFileSync(join(migrationsDir, f), "utf-8"));
}

writeFileSync(outPath, parts.join("\n"), "utf-8");
console.log(`Wrote ${outPath} (${files.length} migrations)`);
