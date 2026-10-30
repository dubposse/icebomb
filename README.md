# icebomb

Öffentliche Eis-Bewertungs-App (Next.js App Router, Neon PostgreSQL, Cloudflare R2).

## Entwicklung

```bash
pnpm install
cp .env.example .env.local   # Werte eintragen
pnpm db:migrate              # additive Migrationen aus migrations/
pnpm dev
```

## Konfiguration (Umgebungsvariablen)

| Variable | Zweck |
| --- | --- |
| `DATABASE_URL` | Neon-Connection-String (nur Server) |
| `VISITOR_COOKIE_SECRET` | Geheimnis (≥ 16 Zeichen, z. B. `openssl rand -base64 32`) zum Signieren des Besucher-Cookies und Hashen der IPs. In Produktion Pflicht. |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Cloudflare R2 (S3-API), nur Server |
| `R2_PUBLIC_BASE_URL` | Öffentliche Basis-URL des Buckets (r2.dev oder eigene Domain), ohne Slash am Ende |

Ohne R2-Variablen antwortet `POST /api/uploads` nach erfolgreicher Bildprüfung mit 503. Der Bucket muss öffentlich lesbar sein (Custom Domain oder r2.dev). Die Schreibzugriffe laufen ausschließlich serverseitig.

## API

- `GET /api/products?q=&category=&cursor=&limit=` – paginierte Liste inkl. Bewertungsanzahl
- `GET /api/products/[id]`
- `POST /api/products` – JSON, benötigt zuvor hochgeladenen `image_key`
- `GET|PUT /api/products/[id]/ratings` – Durchschnitt, eigene Bewertung; PUT ersetzt die Bewertung des Besuchers
- `POST /api/uploads` – multipart (`file`), JPEG/PNG/WebP bis 5 MB, wird zu WebP (Hauptbild + Thumbnail) umgewandelt

## Tests

```bash
pnpm test      # Unit-Tests (ohne Netzwerk)
pnpm test:db   # Integration gegen Neon; legt nur eigene Testzeilen an und löscht sie wieder
```
