import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class ImageError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.status = status;
  }
}

// Erkennt das Format am Inhalt, richtet nach EXIF aus und entfernt alle Metadaten (Standardverhalten von sharp).
export async function processImage(buffer) {
  if (!buffer?.length) throw new ImageError("Die Datei ist leer.");
  if (buffer.length > MAX_UPLOAD_BYTES) throw new ImageError("Das Bild ist zu groß (maximal 5 MB).", 413);

  let meta;
  try {
    meta = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch {
    throw new ImageError("Die Datei ist kein gültiges Bild.", 415);
  }
  if (!ALLOWED_FORMATS.has(meta.format)) {
    throw new ImageError("Nur JPEG-, PNG- oder WebP-Bilder sind erlaubt.", 415);
  }

  const base = () => sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" }).rotate();
  try {
    const [main, thumb] = await Promise.all([
      base().resize({ width: 1000, height: 1000, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
      base().resize({ width: 480, height: 600, fit: "inside", withoutEnlargement: true }).webp({ quality: 75 }).toBuffer(),
    ]);
    return { main, thumb };
  } catch {
    throw new ImageError("Das Bild konnte nicht verarbeitet werden.", 422);
  }
}

export const thumbKey = (key) => key.replace(/\.webp$/, "-sm.webp");
