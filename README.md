# VKU Zug – Verkehrskundeunterricht Website

Eine moderne, SEO-optimierte Website für Verkehrskundeunterricht (VKU) im Kanton Zug, gebaut mit Astro.js und Cloudflare.

## Features

- **Astro.js Framework**: Schnelle, statische Website mit minimalem JavaScript
- **Tailwind CSS**: Modernes, responsives Design
- **SEO-Optimiert**: Meta-Tags, Schema Markup, Breadcrumbs, Open Graph
- **Kontaktformular**: Mit Validierung und Cloudflare KV-Integration
- **Mehrsprachig vorbereitet**: Deutsche Inhalte (de-CH)
- **Barrierefreiheit**: WCAG 2.1 AA Standards
- **Performance**: Zielwerte ≥ 90 für Lighthouse Metriken
- **Cloudflare Pages**: Deployment-ready

## Projektstruktur

```
vku-kurs-zug/
├── src/
│   ├── pages/                 # Astro Pages (Auto-Routing)
│   │   ├── index.astro       # Startseite
│   │   ├── kursinhalt.astro  # Kursinhalt
│   │   ├── faq.astro         # FAQ
│   │   ├── kontakt.astro     # Kontaktseite
│   │   ├── datenschutz.astro # Datenschutz
│   │   ├── impressum.astro   # Impressum
│   │   ├── ort/              # Ortsseiten
│   │   │   ├── zug-hauptbahnhof.astro
│   │   │   ├── baar.astro
│   │   │   └── steinhausen.astro
│   │   └── api/
│   │       └── contact.ts    # Kontaktformular API
│   ├── layouts/
│   │   └── BaseLayout.astro  # Globales Layout
│   ├── styles/
│   │   └── global.css        # Globale Styles
│   ├── data/
│   │   └── vku_data.json     # Zentrale Daten
│   └── components/           # Wiederverwendbare Komponenten
├── public/                   # Statische Assets
├── dist/                     # Build Output
├── scripts/                  # Build & QA Scripts
├── astro.config.mjs         # Astro Konfiguration
├── wrangler.jsonc           # Cloudflare Workers Konfiguration
└── package.json             # Dependencies
```

## Installation & Setup

### Voraussetzungen
- Node.js 18+
- npm oder pnpm

### Schritt 1: Abhängigkeiten installieren
```bash
npm install
```

### Schritt 2: Entwicklungsserver starten
```bash
npm run dev
```

Die Website ist dann verfügbar unter `http://localhost:3000`

### Schritt 3: Build für Production
```bash
npm run build
```

### Schritt 4: Preview des Builds
```bash
npm run preview
```

## Inhalte bearbeiten

### Kursdaten ändern
Alle Kursinformationen (Preis, Dauer, Module, FAQ) sind in `/src/data/vku_data.json` gespeichert.

### Seiten bearbeiten
Alle Seiten befinden sich in `/src/pages/`. Einfach die `.astro`-Dateien bearbeiten und speichern.

### Layout anpassen
Das globale Layout ist in `/src/layouts/BaseLayout.astro` definiert.

## Deployment auf Cloudflare Pages

1. Push dein Projekt zu GitHub
2. Verbinde dein GitHub-Repository mit Cloudflare Pages
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Konfiguriere deine Domain `vku-kurs-zug.ch`

## Lizenz

© 2025 VKU Zug. Alle Rechte vorbehalten.
