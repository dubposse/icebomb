import { NextResponse } from "next/server";
import { fail, PUBLIC_CACHE, serverError } from "@/server/http";
import { getProduct } from "@/server/products";
import { isUuid } from "@/lib/validation";

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!isUuid(id)) return fail(400, "Ungültige Produkt-ID.");
  try {
    const product = await getProduct(id);
    if (!product) return fail(404, "Produkt nicht gefunden.");
    return NextResponse.json(product, { headers: PUBLIC_CACHE });
  } catch (err) {
    return serverError(err);
  }
}
