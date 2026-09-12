# Brick Breaker Ball Web

[![Read in Arabic](https://img.shields.io/badge/Read_in_Arabic-README--AR.md-0f766e?style=for-the-badge)](README_AR.md)

A bilingual website and playable HTML5 browser edition for **Brick Breaker Ball**. It includes the landing pages, world gallery, rules and privacy pages, plus a responsive Canvas-based game.

English is available at `/en` and Arabic is available at `/ar`.

<p>
  <img src="game-pic.png" alt="Brick Breaker Ball home page" width="190" />
  <img src="game-pic1.png" alt="Brick Breaker Ball play page" width="190" />
  <img src="game-pic2.png" alt="Brick Breaker Ball worlds page" width="190" />
  <img src="game-pic3.png" alt="Brick Breaker Ball cosmetics page" width="190" />
</p>

[![Next.js](https://img.shields.io/badge/Next.js-15.5.24-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![HTML5 Canvas](https://img.shields.io/badge/Game-HTML5_Canvas-e34f26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![pnpm](https://img.shields.io/badge/Package_manager-pnpm-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

## Overview

The site uses the Next.js App Router and presents the game's content and assets across desktop, tablet and mobile layouts. The play page uses HTML5 Canvas for paddle movement, ball physics, brick collisions, stages, lives, power-ups and special bricks.

This is a web adaptation rather than a direct runtime of the original LibGDX Android game. It reuses the supplied campaign structure, artwork, sounds, videos and sprite metadata in a browser-friendly implementation.

## Features

- English and Arabic interfaces with separate routes.
- 90 campaign stages across 13 worlds.
- Animated world backgrounds from `public/game/worlds`.
- 60 selectable ball cosmetics from `balls_set`.
- 36 paddle style sets, each containing `Normal`, `Weapon` and `Sticky` variants.
- Sprite-sheet paddle rendering based on the supplied JSON frame metadata.
- Mouse, touch, arrow-key and `A`/`D` controls.
- Local progress and loadout persistence through `localStorage`.
- Separate rules and privacy pages in both languages.
- Responsive styling built with Tailwind CSS.

---

<p>
<img src="public/game/assets/sprites/spritesheet.png" alt="Brick Breaker Ball spritesheet" width="390" />
<img src="public/game/assets/sprites/paddles-sprites/paddle-group3.png" alt="paddles" width="390" />
</p>

<p>
<img src="public\game\assets\sprites\balls-sprites\balls_set\balls-sheet.png" alt="balls" width="500" />
</p>

## Routes

| Route | Description |
| --- | --- |
| `/` | Redirects to the default English version |
| `/en` | English home page |
| `/en/play` | English browser game |
| `/en/rules` | English rules |
| `/en/privacy` | English privacy page |
| `/ar` | Arabic home page |
| `/ar/play` | Arabic browser game |
| `/ar/rules` | Arabic rules |
| `/ar/privacy` | Arabic privacy page |

## Project Structure

```text
BrickBreakerBall-Web/
├── app/                        # Routes, layouts and global styles
│   ├── en/                     # English routes
│   └── ar/                     # Arabic routes
├── components/                 # Site and game components
│   ├── GameCanvas.tsx          # Canvas game, physics and loadouts
│   ├── PlayPage.tsx            # Play page
│   ├── HomePage.tsx            # Home page
│   ├── PageShell.tsx           # Shared wrapper and language direction
│   ├── SiteHeader.tsx          # Navigation
│   ├── SiteFooter.tsx          # Footer
│   ├── RulesPage.tsx            # Rules page
│   ├── RulesMarkdown.tsx        # Markdown renderer
│   └── PrivacyPage.tsx          # Privacy page
├── content/                   # Rules and ball metadata
├── lib/site.ts                # Copy, languages, worlds and links
├── public/game/               # Images, audio, sprites and videos
│   ├── assets/                # Bricks, effects, power-ups and UI
│   ├── audio/                 # Sound effects
│   ├── sprites/               # Ball and paddle sprite sheets
│   └── worlds/                # World videos 1.mp4 through 13.mp4
├── next.config.ts             # Next.js configuration
├── package.json               # Scripts and dependencies
└── pnpm-lock.yaml             # Locked dependency versions
```

## Technologies

- **Next.js 15 App Router:** routing, layouts and metadata.
- **React 19:** component composition and interactive state.
- **TypeScript:** typed application and asset data.
- **Tailwind CSS 4:** responsive UI styling.
- **HTML5 Canvas:** board, bricks, ball, paddle and HUD rendering.
- **`requestAnimationFrame`:** game loop and physics updates.
- **Web Audio:** brick, wall, power-up and explosion sounds.
- **Pointer Events:** shared mouse and touch controls.
- **`localStorage`:** stage progress and selected cosmetics.

## Local Development

Requirements: Node.js compatible with Next.js 15 and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Set the production URL used by Open Graph metadata with:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
```

## Production Build

```bash
pnpm check
pnpm build
pnpm start
```

If development reports a missing generated chunk such as `Cannot find module './17.js'`, stop Next.js, remove `.next`, and start it again:

```powershell
Remove-Item .next -Recurse -Force
pnpm dev
```

## Deployment

Import the repository into Vercel and use the default Next.js settings. Add `NEXT_PUBLIC_SITE_URL` with the production URL. No database or API server is required by the current web edition.

## Privacy and Scope

The project does not include accounts, payments, advertising or third-party analytics by default. The game stores the unlocked stage, selected ball and selected paddle style in browser `localStorage`.

The web edition supports all 90 campaign stages and uses the supplied structure and assets, but it is not intended to reproduce every native LibGDX mechanic one-to-one.
