import { query, isUniqueViolation } from "./db.js";
import { publicUrl } from "./r2.js";
import { thumbKey } from "./images.js";

export const DEFAULT_LIMIT = 24;
export const MAX_LIMIT = 60;

export function serializeProduct(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    brand: row.brand,
    shop: row.shop_name,
    city: row.city,
    imageUrl: publicUrl(row.image_key),
    thumbUrl: row.image_key ? publicUrl(thumbKey(row.image_key)) : null,
    ratingCount: row.rating_count ?? 0,
    createdAt: row.created_at,
  };
}

const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

export const encodeCursor = (ts, id) => Buffer.from(`${ts}|${id}`).toString("base64url");

export function decodeCursor(cursor) {
  try {
    const [ts, id] = Buffer.from(cursor, "base64url").toString("utf8").split("|");
    if (!ts || !id || Number.isNaN(Date.parse(ts))) return null;
    return { ts, id };
  } catch {
    return null;
  }
}

// Eine einzige Abfrage: Seite + Bewertungsanzahl (kein N+1).
export async function listProducts({ limit, cursor, q, category }) {
  const params = [];
  const where = [];
  const add = (v) => (params.push(v), `$${params.length}`);

  if (category) where.push(`category = ${add(category)}`);
  if (q) {
    const p = add(`%${escapeLike(q)}%`);
    where.push(
      `(name ILIKE ${p} OR brand ILIKE ${p} OR shop_name ILIKE ${p} OR city ILIKE ${p})`,
    );
  }
  if (cursor) {
    where.push(`(created_at, id) < (${add(cursor.ts)}::timestamptz, ${add(cursor.id)}::uuid)`);
  }
  const lim = add(limit + 1);

  const rows = await query(
    `WITH page AS (
       SELECT id, name, category, brand, shop_name, city, image_key, created_at,
              created_at::text AS created_text
       FROM ice_products
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY created_at DESC, id DESC
       LIMIT ${lim}
     )
     SELECT page.*,
            (SELECT count(*)::int FROM ice_ratings r WHERE r.product_id = page.id) AS rating_count
     FROM page
     ORDER BY created_at DESC, id DESC`,
    params,
  );

  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const last = items.at(-1);
  return {
    items: items.map(serializeProduct),
    nextCursor: hasMore && last ? encodeCursor(last.created_text, last.id) : null,
  };
}

export async function getProduct(id) {
  const rows = await query(
    `SELECT p.id, p.name, p.category, p.brand, p.shop_name, p.city, p.image_key, p.created_at,
            (SELECT count(*)::int FROM ice_ratings r WHERE r.product_id = p.id) AS rating_count
     FROM ice_products p WHERE p.id = $1`,
    [id],
  );
  return rows[0] ? serializeProduct(rows[0]) : null;
}

export async function findDuplicate(dedupeKey) {
  const rows = await query("SELECT id FROM ice_products WHERE dedupe_key = $1 LIMIT 1", [dedupeKey]);
  return rows[0]?.id ?? null;
}

// Übernimmt einen eigenen, noch nicht verwendeten Upload atomar.
export async function claimUpload(imageKey, visitorId) {
  const rows = await query(
    `UPDATE ice_uploads SET claimed_at = now()
     WHERE image_key = $1 AND visitor_id = $2 AND claimed_at IS NULL
     RETURNING image_key`,
    [imageKey, visitorId],
  );
  return rows.length === 1;
}

export const releaseUpload = (imageKey) =>
  query("UPDATE ice_uploads SET claimed_at = NULL WHERE image_key = $1", [imageKey]);

export async function insertProduct(p) {
  const rows = await query(
    `INSERT INTO ice_products (name, category, brand, shop_name, city, image_key, dedupe_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, category, brand, shop_name, city, image_key, created_at`,
    [p.name, p.category, p.brand, p.shop_name, p.city, p.image_key, p.dedupe_key],
  );
  return serializeProduct(rows[0]);
}

export { isUniqueViolation };
