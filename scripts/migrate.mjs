// Nutzung: pnpm db:migrate  (liest DATABASE_URL aus .env.local)
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL fehlt.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const dir = fileURLToPath(new URL("../migrations/", import.meta.url));
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const text = (await readFile(join(dir, file), "utf8"))
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  for (const statement of text.split(";").map((s) => s.trim()).filter(Boolean)) {
    await sql.query(statement);
  }
  console.log(`✓ ${file}`);
}
