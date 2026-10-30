import { NextResponse } from "next/server";
import { fail, guardMutation, PUBLIC_CACHE, readJson, serverError, NO_STORE } from "@/server/http";
import { resolveVisitor } from "@/server/visitor";
import { validateProductInput, CATEGORY_IDS } from "@/lib/validation";
import {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  claimUpload,
  decodeCursor,
  findDuplicate,
  insertProduct,
  isUniqueViolation,
  listProducts,
  releaseUpload,
} from "@/server/products";

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(parseInt(params.get("limit") ?? "", 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);

  const category = params.get("category");
  if (category && !CATEGORY_IDS.includes(category)) return fail(400, "Ungültige Kategorie.");

  const rawCursor = params.get("cursor");
  const cursor = rawCursor ? decodeCursor(rawCursor) : null;
  if (rawCursor && !cursor) return fail(400, "Ungültiger Cursor.");

  const q = params.get("q")?.trim().slice(0, 100) || null;

  try {
    const data = await listProducts({ limit, cursor, q, category });
    return NextResponse.json(data, { headers: PUBLIC_CACHE });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request) {
  try {
    const blocked = await guardMutation(request, "product");
    if (blocked) return blocked;

    const body = await readJson(request);
    if (body.tooLarge) return fail(413, "Anfrage zu groß.");
    if (body.invalid) return fail(400, "Ungültiges JSON.");

    const parsed = validateProductInput(body.data);
    if (!parsed.ok) return fail(400, "Bitte die markierten Felder prüfen.", { fields: parsed.errors });
    const product = parsed.value;

    const visitor = resolveVisitor(request, { create: false });
    if (!visitor.id) {
      return fail(400, "Bitte das Bild zuerst hochladen.", { fields: { image_key: "Bitte das Bild zuerst hochladen." } });
    }

    const duplicate = await findDuplicate(product.dedupe_key);
    if (duplicate) return fail(409, "Dieses Eis gibt es bereits.", { existingId: duplicate });

    if (!(await claimUpload(product.image_key, visitor.id))) {
      return fail(400, "Das Bild ist unbekannt oder wurde bereits verwendet. Bitte erneut hochladen.", {
        fields: { image_key: "Bitte das Bild erneut hochladen." },
      });
    }

    try {
      const created = await insertProduct(product);
      return NextResponse.json(created, { status: 201, headers: NO_STORE });
    } catch (err) {
      await releaseUpload(product.image_key).catch(() => {});
      if (isUniqueViolation(err)) {
        const existingId = await findDuplicate(product.dedupe_key).catch(() => null);
        return fail(409, "Dieses Eis gibt es bereits.", { existingId });
      }
      throw err;
    }
  } catch (err) {
    return serverError(err);
  }
}
