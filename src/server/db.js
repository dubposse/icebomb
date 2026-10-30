import { neon } from "@neondatabase/serverless";

let client;

// Nur serverseitig verwenden. Lazy, damit der Build ohne DATABASE_URL nicht scheitert.
export function sql() {
  if (!client) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL fehlt.");
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

export const query = (text, params = []) => sql().query(text, params);

export const isUniqueViolation = (err) => err?.code === "23505";
export const isForeignKeyViolation = (err) => err?.code === "23503";
