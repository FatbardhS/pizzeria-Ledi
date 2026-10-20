# Pizzeria Ledi

Website der Pizzeria Ledi (Berlin-Lichtenberg), gebaut mit [Astro](https://astro.build) und Tailwind CSS.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # statische Seite in dist/
```

## Aufbau

Zwei Standorte unter einer Domain:

- `/` – Intro und Standortwahl (bei jedem Besuch)
- `/ledi/…` – Pizzeria Ledi, Weitlingstraße 28
- `/due/…` – Pizzeria Ledi Due, Lückstraße 34

Die Seiten liegen einmal in `src/pages/[loc]/` und werden für beide Standorte erzeugt.

## Inhalte ändern

- **Name, Adresse, Telefon, E-Mail, Öffnungszeiten je Standort:** `locations` in `src/data/site.ts`
- **Wochenkarte & Preise:** auf `/admin`
- **Bilder, Bewertungen, Social Media:** `src/data/site.ts`
- **Speisekarte (für beide gleich):** `src/data/menu.ts`
- **Impressum / Datenschutz:** `src/pages/[loc]/impressum.astro`, `src/pages/[loc]/datenschutz.astro` (Text noch einfügen)

Schriften liegen lokal (Fontsource), Google Maps lädt erst nach Zustimmung im Cookie-Banner.

Fotos liegen in `public/images` (von der alten Website übernommen, als WebP verkleinert), die Wochenkarte in `public/files`. Titelbild (Holzofen): Arthur Brognoli / Unsplash.

## Online-Bestellung & Verwaltung

- `/ledi/bestellen`, `/due/bestellen` – Warenkorb; die Bestellung wird per WhatsApp an den jeweiligen Standort geschickt
  (Nummer: `whatsapp` je Standort in `src/data/site.ts`, Lieferbedingungen: `delivery`).
- `/admin` – Wochenkarte pflegen und Preise der Speisekarte eintragen (nur Gerichte mit Preis sind bestellbar).
- Daten liegen in Supabase (`supabase/schema.sql`), gelesen über `/api/menu`.

### Einrichtung (einmalig)

1. Kostenloses Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Im SQL Editor den Inhalt von `supabase/schema.sql` ausführen.
3. In Vercel → Project → Settings → Environment Variables eintragen (siehe `.env.example`):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API) und ein langes `ADMIN_PASSWORD`.
4. Neu veröffentlichen (`npm run deploy`).

Lokal ohne Supabase läuft `/admin` im Testmodus (Passwort `admin`, Daten nur im Speicher).

## Veröffentlichen

Live: https://pizzeria-ledi.vercel.app

```bash
npm run deploy   # baut die Seite und veröffentlicht sie auf Vercel
```
