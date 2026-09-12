# Brick Breaker Ball — Next.js Website

Bilingual (English default + Arabic) promotional website and playable browser edition for **Brick Breaker Ball**.

## Included

- Next.js App Router + TypeScript
- Tailwind CSS
- Default route redirects to `/en`
- Arabic version under `/ar`
- Responsive homepage using the game's splash video, 13 world images and world videos
- Full 60-ball cosmetic gallery and six paddle sprite sheets
- Playable HTML5 Canvas web edition with 90 stages / 13 worlds
- Touch, mouse, keyboard and tablet-friendly controls
- Browser progression saved in `localStorage`
- English and Arabic game-rules pages sourced from the supplied project documents
- English and Arabic privacy-policy pages
- Game images, sounds and videos copied from the supplied Android project

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run check
npm run build
npm start
```

## Deploy to Vercel

Import this folder as a new Vercel project. No special build command is required beyond the default Next.js build.

## Web game note

The browser version is a purpose-built HTML5 adaptation that uses the supplied campaign structure, world progression, videos, brick art, ball cosmetics, paddle art and audio. It is playable across all 90 stages, but it is not a compiled copy of the LibGDX Android runtime and therefore does not reproduce every native special mechanic 1:1 yet.

## Privacy

The website code does not include third-party analytics, ad trackers, accounts or payment forms by default. The web game stores its local progress in browser `localStorage`.
