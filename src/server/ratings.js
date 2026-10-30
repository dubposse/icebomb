import { query } from "./db.js";

// Reihenfolge entspricht SCALES in src/data/scales.js.
export const SCALE_COLUMNS = [
  "artificial_natural",
  "bland_umami",
  "oriental_european",
  "modern_classic",
  "hipster_oldschool",
  "fruity_milky",
  "winter_summer",
  "waste_delicious",
  "never_buy_again",
];

export async function getRatingSummary(productId, visitorId) {
  const avgCols = SCALE_COLUMNS.map((c) => `avg(${c})::float8 AS ${c}`).join(", ");
  const [summary, own] = await Promise.all([
    query(`SELECT count(*)::int AS count, ${avgCols} FROM ice_ratings WHERE product_id = $1`, [productId]),
    visitorId
      ? query(
          `SELECT ${SCALE_COLUMNS.join(", ")} FROM ice_ratings WHERE product_id = $1 AND visitor_id = $2`,
          [productId, visitorId],
        )
      : Promise.resolve([]),
  ]);
  const row = summary[0];
  return {
    count: row.count,
    average: row.count > 0 ? SCALE_COLUMNS.map((c) => row[c]) : null,
    own: own[0] ? SCALE_COLUMNS.map((c) => own[0][c]) : null,
  };
}

// Upsert über (product_id, visitor_id): ersetzt die bisherige Bewertung.
export async function upsertRating(productId, visitorId, values) {
  const cols = SCALE_COLUMNS.join(", ");
  const placeholders = values.map((_, i) => `$${i + 3}`).join(", ");
  const updates = SCALE_COLUMNS.map((c) => `${c} = EXCLUDED.${c}`).join(", ");
  await query(
    `INSERT INTO ice_ratings (product_id, visitor_id, ${cols})
     VALUES ($1, $2, ${placeholders})
     ON CONFLICT (product_id, visitor_id) DO UPDATE SET ${updates}, updated_at = now()`,
    [productId, visitorId, ...values],
  );
}
