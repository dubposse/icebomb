import { SCALES } from "../data/scales.js";

export const CATEGORY_IDS = ["stiel", "kanister", "diele"];
export const MAX_TEXT = 150;
export const IMAGE_KEY_RE =
  /^products\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (v) => typeof v === "string" && UUID_RE.test(v);

export function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

// Vergleichswert: ohne Akzente/Groß-/Kleinschreibung/Satzzeichen.
export function normalizeText(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function suspicious(text) {
  if (/[<>]/.test(text)) return true;
  if (/\p{C}/u.test(text)) return true;
  if (/(https?:\/\/|www\.|\.(com|de|net|org|ru|xyz)\b)/i.test(text)) return true;
  if (/(.)\1{7,}/u.test(text)) return true;
  return !/[\p{L}\p{N}]/u.test(text);
}

function readField(input, key, label, { required }, errors) {
  const raw = input[key];
  if (raw === undefined || raw === null || raw === "") {
    if (required) errors[key] = `${label} ist erforderlich.`;
    return null;
  }
  if (typeof raw !== "string") {
    errors[key] = `${label} ist ungültig.`;
    return null;
  }
  const text = cleanText(raw);
  if (!text) {
    if (required) errors[key] = `${label} ist erforderlich.`;
    return null;
  }
  if (text.length > MAX_TEXT) {
    errors[key] = `${label} darf höchstens ${MAX_TEXT} Zeichen haben.`;
    return null;
  }
  if (suspicious(text)) {
    errors[key] = `${label} enthält unzulässige Zeichen oder Inhalte.`;
    return null;
  }
  return text;
}

export function buildDedupeKey({ category, name, brand, shop_name, city }) {
  const parts =
    category === "diele"
      ? [category, name, shop_name, city]
      : [category, name, brand];
  return parts.map((p) => normalizeText(p ?? "")).join("|");
}

// Liefert { ok: true, value } oder { ok: false, errors }.
export function validateProductInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: { _: "Ungültige Anfrage." } };
  }
  const errors = {};
  const category = input.category;
  if (!CATEGORY_IDS.includes(category)) errors.category = "Bitte eine gültige Kategorie wählen.";

  const isDiele = category === "diele";
  const name = readField(input, "name", "Der Name der Sorte", { required: true }, errors);
  const brand = readField(
    input,
    "brand",
    "Marke / Hersteller",
    { required: category === "stiel" || category === "kanister" },
    errors,
  );
  const shop_name = readField(input, "shop_name", "Der Name des Ladens", { required: isDiele }, errors);
  const city = readField(input, "city", "Der Ort", { required: isDiele }, errors);

  const imageKey = input.image_key;
  if (typeof imageKey !== "string" || !IMAGE_KEY_RE.test(imageKey)) {
    errors.image_key = "Bitte zuerst ein gültiges Produktbild hochladen.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const value = {
    category,
    name,
    brand: isDiele ? null : brand,
    shop_name: isDiele ? shop_name : null,
    city: isDiele ? city : null,
    image_key: imageKey,
  };
  return { ok: true, value: { ...value, dedupe_key: buildDedupeKey(value) } };
}

export function validateRatingValues(body) {
  const values = body?.values;
  if (!Array.isArray(values) || values.length !== SCALES.length) {
    return { ok: false, error: `Genau ${SCALES.length} Skalenwerte erforderlich.` };
  }
  if (!values.every((v) => Number.isInteger(v) && v >= 0 && v <= 100)) {
    return { ok: false, error: "Alle Skalenwerte müssen ganze Zahlen von 0 bis 100 sein." };
  }
  return { ok: true, values };
}
