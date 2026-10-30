# icebomb

🍦💣 **icebomb – Taste. Rate. Repeat.**

Eine öffentliche Web-App zum Entdecken, Bewerten und Vergleichen von Eisprodukten. Ob Eis am Stiel, im Kanister oder von der Diele – auf icebomb kann jeder neue Eissorten mit Bild hinzufügen und seinen Geschmack auf neun ungewöhnlichen Skalen bewerten.

Keine Registrierung, keine klassische Sternebewertung. Stattdessen entstehen aus den Bewertungen individuelle Geschmacksprofile und gemeinsame Durchschnittswerte.

**Live-Demo:** https://icebomb.vercel.app

## Funktionen

- Eisprodukte mit Bildern hinzufügen und öffentlich entdecken
- Drei Kategorien: Eis am Stiel, Eis im Kanister und Eis von der Diele
- Neun bipolare Bewertungsskalen von 0 bis 100
- Individuelle Bewertungen und aggregierte Geschmacksprofile
- Bewertungen ohne Benutzerkonto; erneute Bewertung aktualisiert die bisherige
- Produktsuche und Kategorie-Filter
- Responsives, animationsreiches Frontend

## Tech-Stack

- **Frontend:** Next.js 16 (App Router), React 19, JavaScript, CSS
- **Animationen:** Motion for React, GSAP und CSS
- **Datenbank:** Neon PostgreSQL
- **Bildspeicherung:** Cloudflare R2 (S3-kompatibel)
- **Bildverarbeitung:** Sharp (WebP-Konvertierung und Optimierung)
- **Hosting:** Vercel
- **Paketmanager:** pnpm

## Technische Besonderheiten

- Serverseitige API-Routen für Produkte, Bewertungen und Bild-Uploads
- Anonyme Besucherkennung über signierte HttpOnly-Cookies
- Aktualisierung bestehender Bewertungen statt mehrfacher Bewertungen desselben Browsers
- Bildoptimierung mit WebP-Konvertierung und Thumbnail-Erstellung
- Persistentes Rate-Limiting und grundlegende Missbrauchsschutzmaßnahmen
- Responsive Motion-Design mit Unterstützung für `prefers-reduced-motion`

---

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

## Lizenz

icebomb ist unter der **GNU Affero General Public License v3.0 (AGPL-3.0)** veröffentlicht.

Copyright (C) 2026 Matthias Brehm

Weitere Informationen findest du in der Datei(LICENSE).
