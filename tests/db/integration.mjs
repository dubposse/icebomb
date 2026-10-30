// Integrationstest gegen Neon. Legt ausschließlich eigene, markierte Testzeilen an und löscht nur diese.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { query } from "../../src/server/db.js";
import {
  claimUpload,
  findDuplicate,
  getProduct,
  insertProduct,
  isUniqueViolation,
  listProducts,
  releaseUpload,
} from "../../src/server/products.js";
import { getRatingSummary, upsertRating } from "../../src/server/ratings.js";
import { consumeRateLimit } from "../../src/server/rate-limit.js";
import { buildDedupeKey } from "../../src/lib/validation.js";
import { registerUpload } from "../../src/server/uploads.js";

const marker = `ZZTEST-${randomUUID().slice(0, 8)}`;
const visitorA = randomUUID();
const visitorB = randomUUID();
const keys = [];
let productId;
const rateBucketHeaders = new Headers({ "x-real-ip": `test-${marker}` });

function newKey() {
  const k = `products/${randomUUID()}.webp`;
  keys.push(k);
  return k;
}

try {
  const fields = { category: "stiel", name: marker, brand: "Testmarke" };
  const dedupe_key = buildDedupeKey(fields);
  const image_key = newKey();

  await registerUpload(image_key, visitorA);
  assert.equal(await claimUpload(image_key, visitorB), false, "fremder Upload darf nicht übernommen werden");
  assert.equal(await claimUpload(image_key, visitorA), true);
  assert.equal(await claimUpload(image_key, visitorA), false, "doppeltes Übernehmen verhindert");
  await releaseUpload(image_key);
  assert.equal(await claimUpload(image_key, visitorA), true);

  assert.equal(await findDuplicate(dedupe_key), null);
  const created = await insertProduct({ ...fields, shop_name: null, city: null, image_key, dedupe_key });
  productId = created.id;
  assert.equal(await findDuplicate(dedupe_key), productId);
  await assert.rejects(
    insertProduct({ ...fields, shop_name: null, city: null, image_key: newKey(), dedupe_key }),
    isUniqueViolation,
  );

  let list = await listProducts({ limit: 5, q: marker, category: "stiel" });
  assert.equal(list.items.length, 1);
  assert.equal(list.items[0].ratingCount, 0);
  assert.equal((await listProducts({ limit: 5, q: marker, category: "kanister" })).items.length, 0);
  assert.equal((await listProducts({ limit: 5, q: "%" + marker })).items.length, 0, "Wildcards werden escaped");

  let s = await getRatingSummary(productId, visitorA);
  assert.deepEqual(s, { count: 0, average: null, own: null });

  await upsertRating(productId, visitorA, [0, 10, 20, 30, 40, 50, 60, 70, 80]);
  await upsertRating(productId, visitorB, [100, 10, 20, 30, 40, 50, 60, 70, 100]);
  s = await getRatingSummary(productId, visitorA);
  assert.equal(s.count, 2);
  assert.equal(s.average[0], 50);
  assert.equal(s.average[8], 90);
  assert.deepEqual(s.own, [0, 10, 20, 30, 40, 50, 60, 70, 80]);

  await upsertRating(productId, visitorA, Array(9).fill(100));
  s = await getRatingSummary(productId, visitorA);
  assert.equal(s.count, 2, "erneute Bewertung ersetzt, zählt nicht doppelt");
  assert.equal(s.average[0], 100);
  assert.deepEqual(s.own, Array(9).fill(100));
  assert.equal((await getProduct(productId)).ratingCount, 2);

  await assert.rejects(
    upsertRating(randomUUID(), visitorA, Array(9).fill(50)),
    (e) => e.code === "23503",
    "unbekanntes Produkt",
  );
  await assert.rejects(upsertRating(productId, visitorA, [101, ...Array(8).fill(1)]), (e) => e.code === "23514");

  let last;
  for (let i = 0; i < 7; i++) last = await consumeRateLimit("product", rateBucketHeaders);
  assert.equal(last.allowed, false, "Limit greift nach 6 Anfragen");

  console.log("DB-Integration: alle Prüfungen bestanden");
} finally {
  if (productId) await query("DELETE FROM ice_products WHERE id = $1", [productId]);
  await query("DELETE FROM ice_uploads WHERE image_key = ANY($1::text[])", [keys]);
  const { hashIp } = await import("../../src/server/visitor.js");
  await query("DELETE FROM ice_rate_limits WHERE bucket = $1", [`product:${hashIp(`test-${marker}`)}`]);
}
