// Schutz zustandsändernder Browseranfragen (CSRF): Origin muss zum Host passen.
export function isSameOrigin(headers) {
  const origin = headers.get("origin");
  if (origin) {
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return headers.get("sec-fetch-site") !== "cross-site";
}
