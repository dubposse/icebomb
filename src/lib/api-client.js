// Clientseitiger Zugriff auf die icebomb-API. Fehler tragen status und ggf. fields.
export class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new ApiError("Keine Verbindung. Bitte erneut versuchen.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Etwas ist schiefgelaufen.", res.status, data);
  return data;
}

// Identische, gleichzeitige Listenabfragen teilen sich einen Request (Ticker + Browser).
const inflight = new Map();
let listVersion = 0;

export function fetchProducts({ q = "", category = "", cursor = "", limit = 24, signal } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (cursor) params.set("cursor", cursor);
  if (listVersion) params.set("v", String(listVersion));
  const url = `/api/products?${params}`;
  if (signal) return request(url, { signal });
  if (!inflight.has(url)) {
    const p = request(url).finally(() => inflight.delete(url));
    inflight.set(url, p);
  }
  return inflight.get(url);
}

export const fetchProduct = (id) => request(`/api/products/${id}`);
export const fetchRatings = (id) => request(`/api/products/${id}/ratings`);

export const saveRating = (id, values) =>
  request(`/api/products/${id}/ratings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });

export function uploadImage(file) {
  const body = new FormData();
  body.append("file", file);
  return request("/api/uploads", { method: "POST", body });
}

export async function createProduct(input) {
  const created = await request("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  listVersion += 1;
  return created;
}
