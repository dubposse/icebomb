import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  buildDedupeKey,
  isUuid,
  validateProductInput,
  validateRatingValues,
} from "../src/lib/validation.js";
import { isSameOrigin } from "../src/server/origin.js";
import { createVisitorToken, verifyVisitorToken } from "../src/server/visitor.js";
import { ImageError, processImage, thumbKey } from "../src/server/images.js";
import { windowStart } from "../src/server/rate-limit.js";
import { decodeCursor, encodeCursor } from "../src/server/products.js";

const KEY = "products/123e4567-e89b-42d3-a456-426614174000.webp";
const base = { category: "stiel", name: "Bounty", brand: "Mars", image_key: KEY };

test("Produktvalidierung: gültige Eingaben", () => {
  assert.equal(validateProductInput(base).ok, true);
  const diele = validateProductInput({ category: "diele", name: "Erdbeere", shop_name: "Eis Eck", city: "Köln", image_key: KEY });
  assert.equal(diele.ok, true);
});

test("Produktvalidierung: Pflichtfelder je Kategorie", () => {
  assert.ok(validateProductInput({ ...base, brand: "" }).errors.brand);
  assert.ok(validateProductInput({ category: "diele", name: "X", image_key: KEY }).errors.shop_name);
  assert.ok(validateProductInput({ ...base, category: "foo" }).errors.category);
  assert.ok(validateProductInput({ ...base, image_key: "../x.webp" }).errors.image_key);
  assert.equal(validateProductInput(null).ok, false);
});

test("Produktvalidierung: Länge und verdächtige Inhalte", () => {
  assert.equal(validateProductInput({ ...base, name: "a".repeat(151) }).ok, false);
  assert.equal(validateProductInput({ ...base, name: "<script>" }).ok, false);
  assert.equal(validateProductInput({ ...base, name: "http://spam.example" }).ok, false);
});

test("Duplikatschlüssel ist normalisiert", () => {
  const a = buildDedupeKey({ category: "stiel", name: " BOUNTY ", brand: "mars" });
  const b = buildDedupeKey({ category: "stiel", name: "bounty", brand: "Mars " });
  assert.equal(a, b);
});

test("Bewertungswerte: genau neun Ganzzahlen 0..100", () => {
  const ok = Array(9).fill(50);
  assert.equal(validateRatingValues({ values: ok }).ok, true);
  assert.equal(validateRatingValues({ values: [0, 100, ...Array(7).fill(1)] }).ok, true);
  assert.equal(validateRatingValues({ values: ok.slice(1) }).ok, false);
  assert.equal(validateRatingValues({ values: [...ok.slice(1), 101] }).ok, false);
  assert.equal(validateRatingValues({ values: [...ok.slice(1), -1] }).ok, false);
  assert.equal(validateRatingValues({ values: [...ok.slice(1), 1.5] }).ok, false);
  assert.equal(validateRatingValues({ values: [...ok.slice(1), "50"] }).ok, false);
  assert.equal(validateRatingValues({}).ok, false);
});

test("UUID-Prüfung", () => {
  assert.equal(isUuid("123e4567-e89b-42d3-a456-426614174000"), true);
  assert.equal(isUuid("neu-1"), false);
  assert.equal(isUuid("1; DROP TABLE"), false);
});

test("Origin-Prüfung", () => {
  const h = (o) => new Headers(o);
  assert.equal(isSameOrigin(h({ origin: "https://a.de", host: "a.de" })), true);
  assert.equal(isSameOrigin(h({ origin: "https://evil.de", host: "a.de" })), false);
  assert.equal(isSameOrigin(h({ "sec-fetch-site": "cross-site", host: "a.de" })), false);
});

test("Besucher-Token: Signatur wird geprüft", () => {
  const { id, token } = createVisitorToken();
  assert.equal(verifyVisitorToken(token), id);
  assert.equal(verifyVisitorToken(token.slice(0, -2) + "xx"), null);
  assert.equal(verifyVisitorToken(`${id}.`), null);
  assert.equal(verifyVisitorToken(undefined), null);
});

test("Rate-Limit-Fenster ist stabil", () => {
  const a = windowStart(1_000_000, 600);
  const b = windowStart(1_000_000 + 1000, 600);
  assert.equal(a.getTime(), b.getTime());
});

test("Cursor: Roundtrip und Ablehnung", () => {
  const c = encodeCursor("2025-01-01 10:00:00.123456+00", "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(decodeCursor(c).id, "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(decodeCursor("%%%"), null);
});

test("Bildverarbeitung: gültige Bilder werden zu WebP", async () => {
  const png = await sharp({ create: { width: 2000, height: 1500, channels: 3, background: "#f0a" } }).png().toBuffer();
  const out = await processImage(png);
  const meta = await sharp(out.main).metadata();
  assert.equal(meta.format, "webp");
  assert.ok(meta.width <= 1000);
  assert.ok((await sharp(out.thumb).metadata()).width <= 480);
  const jpg = await sharp({ create: { width: 50, height: 50, channels: 3, background: "#0f0" } }).jpeg().toBuffer();
  assert.ok((await processImage(jpg)).main.length > 0);
  assert.equal(thumbKey(KEY), KEY.replace(".webp", "-sm.webp"));
});

test("Bildverarbeitung: ungültige Dateien werden abgelehnt", async () => {
  await assert.rejects(processImage(Buffer.from("kein bild")), ImageError);
  await assert.rejects(processImage(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>")), ImageError);
  const gif = await sharp({ create: { width: 10, height: 10, channels: 3, background: "#000" } }).gif().toBuffer();
  await assert.rejects(processImage(gif), (e) => e instanceof ImageError && e.status === 415);
  const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: "#000" } }).png().toBuffer();
  await assert.rejects(processImage(png.subarray(0, 30)), ImageError);
});
