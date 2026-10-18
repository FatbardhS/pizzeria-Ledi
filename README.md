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

- `/` – Standortwahl (wird im Browser gemerkt; `/?standort` zeigt sie erneut)
- `/ledi/…` – Pizzeria Ledi, Weitlingstraße 28
- `/due/…` – Pizzeria Ledi Due, Lückstraße 34

Die Seiten liegen einmal in `src/pages/[loc]/` und werden für beide Standorte erzeugt.

## Inhalte ändern

- **Name, Adresse, Telefon, E-Mail, Öffnungszeiten je Standort:** `locations` in `src/data/site.ts`
- **Bilder, Bewertungen, Social Media:** `src/data/site.ts`
- **Speisekarte (für beide gleich):** `src/data/menu.ts`
- **Impressum / Datenschutz:** `src/pages/[loc]/impressum.astro`, `src/pages/[loc]/datenschutz.astro` (Text noch einfügen)

Bilder werden aktuell noch von der alten Website (`pizzeria-ledi.de/wp-content/uploads`) geladen.

## Veröffentlichen

Live: https://pizzeria-ledi.vercel.app

```bash
npm run deploy   # baut die Seite und veröffentlicht sie auf Vercel
```
