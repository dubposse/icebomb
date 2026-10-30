import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { fail, guardMutation, NO_STORE, readBodyLimited, serverError, withVisitorCookie } from "@/server/http";
import { resolveVisitor } from "@/server/visitor";
import { ImageError, MAX_UPLOAD_BYTES, processImage, thumbKey } from "@/server/images";
import { isR2Configured, putImage, deleteImages } from "@/server/r2";
import { cleanupStaleUploads, registerUpload } from "@/server/uploads";

export async function POST(request) {
  try {
    const blocked = await guardMutation(request, "upload");
    if (blocked) return blocked;

    const buf = await readBodyLimited(request, MAX_UPLOAD_BYTES + 64 * 1024);
    if (buf === null) return fail(413, "Bild zu groß (max. 5 MB).");

    let file;
    try {
      const form = await new Response(buf, {
        headers: { "content-type": request.headers.get("content-type") ?? "" },
      }).formData();
      file = form.get("file");
    } catch {
      return fail(400, "Ungültiger Upload.");
    }
    if (!file || typeof file === "string") return fail(400, "Bitte eine Bilddatei auswählen.");
    if (file.size > MAX_UPLOAD_BYTES) return fail(413, "Bild zu groß (max. 5 MB).");

    let processed;
    try {
      processed = await processImage(Buffer.from(await file.arrayBuffer()));
    } catch (err) {
      if (err instanceof ImageError) return fail(err.status, err.message);
      throw err;
    }

    if (!isR2Configured()) return fail(503, "Bild-Speicher ist nicht konfiguriert.");

    const visitor = resolveVisitor(request, { create: true });
    const key = `products/${randomUUID()}.webp`;
    try {
      await putImage(key, processed.main);
      await putImage(thumbKey(key), processed.thumb);
      await registerUpload(key, visitor.id);
    } catch (err) {
      await deleteImages([key, thumbKey(key)]).catch(() => {});
      throw err;
    }
    cleanupStaleUploads().catch(() => {});

    return withVisitorCookie(NextResponse.json({ imageKey: key }, { status: 201, headers: NO_STORE }), visitor);
  } catch (err) {
    return serverError(err);
  }
}
