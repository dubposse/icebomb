import { NextResponse } from "next/server";
import { fail, guardMutation, NO_STORE, readJson, serverError, withVisitorCookie } from "@/server/http";
import { resolveVisitor } from "@/server/visitor";
import { isUuid, validateRatingValues } from "@/lib/validation";
import { getRatingSummary, upsertRating } from "@/server/ratings";
import { isForeignKeyViolation } from "@/server/db";

export async function GET(request, { params }) {
  const { id } = await params;
  if (!isUuid(id)) return fail(400, "Ungültige Produkt-ID.");
  try {
    const visitor = resolveVisitor(request, { create: false });
    const summary = await getRatingSummary(id, visitor.id);
    return NextResponse.json(summary, { headers: NO_STORE });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!isUuid(id)) return fail(400, "Ungültige Produkt-ID.");

    const blocked = await guardMutation(request, "rating");
    if (blocked) return blocked;

    const body = await readJson(request, 2048);
    if (body.tooLarge) return fail(413, "Anfrage zu groß.");
    if (body.invalid) return fail(400, "Ungültiges JSON.");

    const parsed = validateRatingValues(body.data);
    if (!parsed.ok) return fail(400, "Ungültige Bewertungswerte.");

    const visitor = resolveVisitor(request, { create: true });
    try {
      await upsertRating(id, visitor.id, parsed.values);
    } catch (err) {
      if (isForeignKeyViolation(err)) return fail(404, "Produkt nicht gefunden.");
      throw err;
    }
    const summary = await getRatingSummary(id, visitor.id);
    return withVisitorCookie(NextResponse.json(summary, { headers: NO_STORE }), visitor);
  } catch (err) {
    return serverError(err);
  }
}
