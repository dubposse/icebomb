import { NextResponse } from "next/server";
import { isSameOrigin } from "./origin.js";
import { consumeRateLimit } from "./rate-limit.js";
import { VISITOR_COOKIE, visitorCookieOptions } from "./visitor.js";

export const NO_STORE = { "Cache-Control": "private, no-store" };
export const PUBLIC_CACHE = {
  "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=60",
};

export function fail(status, error, extra = {}, headers = NO_STORE) {
  return NextResponse.json({ error, ...extra }, { status, headers });
}

export const serverError = (err) => {
  console.error("[icebomb]", err);
  return fail(500, "Interner Fehler. Bitte später erneut versuchen.");
};

// Prüft Origin und Rate-Limit; gibt bei Verstoß eine fertige Response zurück.
export async function guardMutation(request, action) {
  if (!isSameOrigin(request.headers)) return fail(403, "Anfrage von unzulässiger Herkunft.");
  const limit = await consumeRateLimit(action, request.headers);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte kurz warten und erneut versuchen." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfterSec) } },
    );
  }
  return null;
}

export function withVisitorCookie(response, visitor) {
  if (visitor?.isNew) response.cookies.set(VISITOR_COOKIE, visitor.token, visitorCookieOptions());
  return response;
}

// Liest einen Body mit hartem Größenlimit (auch ohne Content-Length).
export async function readBodyLimited(request, maxBytes) {
  const declared = Number(request.headers.get("content-length"));
  if (declared > maxBytes) return null;
  if (!request.body) return Buffer.alloc(0);
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function readJson(request, maxBytes = 8 * 1024) {
  const buf = await readBodyLimited(request, maxBytes);
  if (buf === null) return { tooLarge: true };
  try {
    return { data: JSON.parse(buf.toString("utf8")) };
  } catch {
    return { invalid: true };
  }
}
