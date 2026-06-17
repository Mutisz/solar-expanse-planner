# Solar Expanse Planner

A mission-planning tool for the [Solar Expanse](https://store.steampowered.com/app/1811150/Solar_Expanse/) game. Plan construction projects by browsing all buildable items, selecting quantities, and seeing aggregated resource costs in a summary table.

**Live app:** https://mutisz.github.io/solar-expanse-planner/

---

## Features

- **Construction tables** for all five item categories:
  - Spacecraft
  - Launch Vehicles
  - Ground Facilities
  - Orbital Modules
  - Transportable Modules
- Per-resource build cost columns (Metals, Alloy, Glass, Polymers, Electronics, Rare Metals, Exotic Alloys, Fissiles, Supplies, Silicon, Water, Helium-3)
- **Summary table** — aggregates quantities and resource costs across all categories
- **Favorites** — star any item to pin it to the top of its table (persisted across sessions)
- **Alphabetical sorting** within each table (favorites sorted first, then the rest)
- **Reset Qty** per table, and **Reset All Qty** across all tables
- All state (quantities, favorites, active tab) persists in browser localStorage — no account or backend needed

---

## Development

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
npm install
```

### Refresh game data

Data files under `src/data/` are scraped from the [Solar Expanse wiki](https://stockmaj.github.io/solar-expanse-wiki/). Re-run the scraper if the wiki is updated:

```bash
npm run scrape
```

### Run dev server

```bash
npm run dev
```

Opens at `http://localhost:5173/solar-expanse-planner/`.

### Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Deployment

The app is published via GitHub Pages. To deploy:

```bash
npm run deploy
```

This builds the project and pushes `dist/` to the `gh-pages` branch of the repository.

---

## Tech stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [usehooks-ts](https://usehooks-ts.com/) — `useLocalStorage` hook
- [node-html-parser](https://github.com/taoqf/node-html-parser) — wiki scraper
