/**
 * Validates required environment variables for build/runtime.
 * Run: npx tsx scripts/validate-env.ts
 * Use in CI: npx tsx scripts/validate-env.ts --ci
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optional = [
  "NEXT_PUBLIC_CONTACT_PHONE",
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "NEXT_PUBLIC_SENTRY_DSN",
] as const;

let failed = false;
for (const key of required) {
  const val = process.env[key];
  if (!val || val.trim() === "") {
    console.error(`Missing required: ${key}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nSet missing variables in .env.local (see .env.example)");
  process.exit(process.argv.includes("--ci") ? 1 : 1);
}

console.log("Environment validation passed.");
for (const key of optional) {
  const val = process.env[key];
  if (!val || val.trim() === "") {
    console.log(`  Optional (not set): ${key}`);
  }
}
