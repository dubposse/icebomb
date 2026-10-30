-- Additive, idempotente Erweiterung für das icebomb-Backend. Keine destruktiven Änderungen.

-- Normalisierter Vergleichsschlüssel gegen doppelte Produkte (bestehende Zeilen bleiben NULL).
ALTER TABLE ice_products ADD COLUMN IF NOT EXISTS dedupe_key text;

CREATE UNIQUE INDEX IF NOT EXISTS ice_products_dedupe_key_uniq
  ON ice_products (dedupe_key) WHERE dedupe_key IS NOT NULL;

-- Keyset-Pagination (neueste zuerst)
CREATE INDEX IF NOT EXISTS ice_products_created_idx
  ON ice_products (created_at DESC, id DESC);

-- Registrierte Bild-Uploads. Ein Produkt darf nur einen eigenen, noch nicht verwendeten Upload übernehmen.
CREATE TABLE IF NOT EXISTS ice_uploads (
  image_key  text PRIMARY KEY,
  visitor_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz
);

CREATE INDEX IF NOT EXISTS ice_uploads_pending_idx
  ON ice_uploads (created_at) WHERE claimed_at IS NULL;

-- Verteiltes Rate-Limiting (Fixed Window). bucket enthält nur einen gesalzenen Hash der IP.
CREATE TABLE IF NOT EXISTS ice_rate_limits (
  bucket       text NOT NULL,
  window_start timestamptz NOT NULL,
  hits         integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);

CREATE INDEX IF NOT EXISTS ice_rate_limits_window_idx
  ON ice_rate_limits (window_start);
