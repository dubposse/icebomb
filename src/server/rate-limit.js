import { query } from "./db.js";
import { hashIp } from "./visitor.js";

// Fixed-Window-Limits, persistiert in Neon (funktioniert über mehrere Serverless-Instanzen).
export const LIMITS = {
  upload: { max: 10, windowSec: 600 },
  product: { max: 6, windowSec: 600 },
  rating: { max: 60, windowSec: 600 },
};

export const windowStart = (nowMs, windowSec) =>
  new Date(Math.floor(nowMs / (windowSec * 1000)) * windowSec * 1000);

export function clientIp(headers) {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

// Gibt { allowed, retryAfterSec } zurück. Gespeichert wird nur ein gesalzener IP-Hash.
export async function consumeRateLimit(action, headers, now = Date.now()) {
  const { max, windowSec } = LIMITS[action];
  const start = windowStart(now, windowSec);
  const bucket = `${action}:${hashIp(clientIp(headers))}`;
  const rows = await query(
    `INSERT INTO ice_rate_limits (bucket, window_start, hits) VALUES ($1, $2, 1)
     ON CONFLICT (bucket, window_start) DO UPDATE SET hits = ice_rate_limits.hits + 1
     RETURNING hits`,
    [bucket, start.toISOString()],
  );
  const hits = rows[0].hits;
  if (Math.random() < 0.02) {
    query("DELETE FROM ice_rate_limits WHERE window_start < now() - interval '1 day'").catch(() => {});
  }
  return {
    allowed: hits <= max,
    retryAfterSec: Math.max(1, Math.ceil((start.getTime() + windowSec * 1000 - now) / 1000)),
  };
}
