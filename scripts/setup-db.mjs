/**
 * Applies the Supabase schema to your project via the Management API.
 *
 * Usage:
 *   1. Get a Supabase Personal Access Token (PAT):
 *      https://supabase.com/dashboard/account/tokens
 *   2. Run: node scripts/setup-db.mjs <your-pat>
 *
 * The script reads the project reference from .env automatically.
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");

if (!existsSync(envPath)) {
  console.error("❌ .env file not found at", envPath);
  process.exit(1);
}

const envContent = readFileSync(envPath, "utf-8");
const match = envContent.match(
  /NEXT_PUBLIC_SUPABASE_URL=https:\/\/(.+)\.supabase\.co/,
);
if (!match) {
  console.error(
    "❌ Could not extract project ref from NEXT_PUBLIC_SUPABASE_URL in .env",
  );
  process.exit(1);
}

const projectRef = match[1];
const pat = process.argv[2];

if (!pat) {
  console.error("❌ Usage: node scripts/setup-db.mjs <supabase-personal-access-token>");
  console.error("");
  console.error("To get a PAT:");
  console.error("  1. Go to https://supabase.com/dashboard/account/tokens");
  console.error("  2. Create a new token with scope 'manage projects'");
  console.error("  3. Pass it as the first argument to this script");
  process.exit(1);
}

const schemaPath = resolve(__dirname, "..", "supabase", "schema.sql");
if (!existsSync(schemaPath)) {
  console.error("❌ schema.sql not found at", schemaPath);
  process.exit(1);
}

const sql = readFileSync(schemaPath, "utf-8");

console.log(`🔧 Applying schema to project: ${projectRef}`);
console.log("");

const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/sql`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pat}`,
    },
    body: JSON.stringify({ content: sql }),
  },
);

if (!response.ok) {
  const text = await response.text();
  console.error(`❌ Failed (${response.status}):`, text);
  process.exit(1);
}

console.log("✅ Schema applied successfully!");
console.log("");
console.log("Next steps:");
console.log("  1. Make sure your .env has the correct anon key from Supabase Dashboard → Settings → API");
console.log("  2. Run 'npm run dev' and navigate to /signup to create your account");
