import { query } from "./db.js";
import { deleteImages } from "./r2.js";
import { thumbKey } from "./images.js";

export const STALE_AFTER = "6 hours";

export const registerUpload = (key, visitorId) =>
  query("INSERT INTO ice_uploads (image_key, visitor_id) VALUES ($1, $2)", [key, visitorId]);

// Löscht nicht übernommene Uploads (z. B. Produktanlage abgebrochen/fehlgeschlagen). Best effort, begrenzt.
export async function cleanupStaleUploads(limit = 20) {
  const rows = await query(
    `SELECT image_key FROM ice_uploads
     WHERE claimed_at IS NULL AND created_at < now() - interval '${STALE_AFTER}'
     ORDER BY created_at LIMIT $1`,
    [limit],
  );
  if (rows.length === 0) return 0;
  const keys = rows.map((r) => r.image_key);
  await deleteImages(keys.flatMap((k) => [k, thumbKey(k)]));
  await query("DELETE FROM ice_uploads WHERE image_key = ANY($1::text[]) AND claimed_at IS NULL", [keys]);
  return keys.length;
}
