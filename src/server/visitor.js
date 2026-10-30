import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isUuid } from "../lib/validation.js";

export const VISITOR_COOKIE = "ib_vid";
const DEV_SECRET = "icebomb-dev-only-secret-do-not-use-in-production";

export function getSecret() {
  const secret = process.env.VISITOR_COOKIE_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("VISITOR_COOKIE_SECRET fehlt oder ist zu kurz.");
  }
  return DEV_SECRET;
}

const sign = (value, secret = getSecret()) =>
  createHmac("sha256", secret).update(value).digest("base64url");

export function createVisitorToken(secret) {
  const id = randomUUID();
  return { id, token: `${id}.${sign(id, secret)}` };
}

// Gibt die Besucher-UUID zurück, wenn die Signatur stimmt, sonst null.
export function verifyVisitorToken(token, secret) {
  if (typeof token !== "string") return null;
  const [id, sig] = token.split(".");
  if (!isUuid(id) || !sig) return null;
  const expected = Buffer.from(sign(id, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return id;
}

export const visitorCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
});

// Liest die Besucherkennung aus dem signierten Cookie oder legt eine neue an (isNew → Cookie setzen).
export function resolveVisitor(request, { create }) {
  const existing = verifyVisitorToken(request.cookies.get(VISITOR_COOKIE)?.value);
  if (existing) return { id: existing, isNew: false, token: null };
  if (!create) return { id: null, isNew: false, token: null };
  const { id, token } = createVisitorToken();
  return { id, isNew: true, token };
}

export function hashIp(ip) {
  return createHmac("sha256", getSecret()).update(`ip:${ip}`).digest("base64url").slice(0, 22);
}
