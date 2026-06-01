// Apply Viaja migrations to a Postgres/Supabase database.
// Usage: DATABASE_URL="postgresql://postgres:[PASSWORD]@db.<ref>.supabase.co:5432/postgres" node scripts/apply-migrations.mjs
// Requires: npm i pg
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "..", "supabase", "migrations");
const url = process.env.DATABASE_URL;
if (!url) { console.error("Set DATABASE_URL"); process.exit(1); }

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  process.stdout.write(`Applying ${f} … `);
  await client.query(readFileSync(join(dir, f), "utf8"));
  console.log("ok");
}
await client.end();
console.log("Done.");
