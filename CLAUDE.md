# Solar Expanse Planner

Mission planning tool for the Solar Expanse game. No backend — all state is in localStorage, deployed to GitHub Pages.

## Tech Stack

- React 19 + TypeScript strict + Vite 8 + Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- `usehooks-ts` for `useLocalStorage` hook
- `node-html-parser` for wiki scraping (dev only)
- Deployed via `gh-pages` package with `base: '/solar-expanse-planner/'` in vite.config

## Commands

- `npm run dev` — start dev server
- `npm run build` — typecheck + production build (`tsc && vite build`)
- `npm run scrape` — re-scrape game data from wiki into `src/data/<version>/`
- `npm run deploy` — build + deploy to gh-pages
- `npm run format` — prettier

## Project Structure

```
src/
  App.tsx                    — root component, two-level navigation (Calculator / Mission Planner)
  types.ts                   — all interfaces (Spacecraft, LaunchVehicle, GroundFacility, OrbitalModule,
                               TransportableModule, CelestialBody, Location, Mission, Resources, ALL_RESOURCES)
  main.tsx                   — React entry point
  index.css                  — Tailwind import + custom scrollbar styles
  vite-env.d.ts              — Vite type declarations (import.meta.glob, etc.)
  data/
    version.json             — current game version metadata
    <version>/               — versioned JSON data files (spacecraft, launchVehicles, groundFacilities,
                               orbitalModules, transportableModules, celestialBodies)
  components/
    tableHelpers.tsx          — shared CSS classes, ResourceIcon, ResourceHeaders, ResourceCells,
                               AmountInput, FavoriteButton, sortWithFavorites, resourcesForDataset, ColumnMenu
    ColumnMenu.tsx            — column visibility popup (checkbox dropdown per table)
    SpacecraftTable.tsx       — \
    LaunchVehiclesTable.tsx   —  | five construction overview tables (same pattern:
    GroundFacilitiesTable.tsx —  | column defs, useLocalStorage for visibility,
    OrbitalModulesTable.tsx   —  | filter, favorites, amounts)
    TransportableModulesTable.tsx — /
    SummaryTable.tsx          — calculator summary (aggregates amounts across all tables)
    missions/
      MissionsView.tsx        — top-level: mission list + add/delete + active mission editor
      MissionEditor.tsx       — name/origin/target inputs + collapsible Payload/Vehicles/Summary
      PayloadSection.tsx      — manual resources + construction picker + transportable modules
      ConstructionPicker.tsx  — category dropdown + ItemPicker for adding constructions
      ItemPicker.tsx          — reusable: filter + favorites + qty input + side-by-side selected list
      VehicleSection.tsx      — spacecraft + launch vehicle pickers with payload mass warnings
      MissionSummary.tsx      — three-section summary (Resources table, Modules table, Vehicles table)
scripts/
  scrape-data.ts             — fetches wiki HTML, parses tables, writes versioned JSON
public/
  images/resources/          — 16x16 resource icons (metal.png, steel.png, etc.)
```

## Key Patterns

### Data Loading
Game data is loaded via `import.meta.glob('./data/*/<file>.json', { import: 'default' })` for lazy versioned loading. The version directory is derived from `version.json` by replacing spaces with underscores.

### State Management
All persistent state uses `useLocalStorage` from `usehooks-ts`:
- `amounts` / `favorites` — calculator quantities and starred items (shared across tables)
- `missions` / `active-mission` — mission planner data
- `active-view` / `active-calc-tab` — navigation state
- `<table>-cols` — per-table column visibility (e.g. `spacecraft-cols`)

### Construction Tables
All five follow the same pattern: `COLUMN_DEFS` array, `useLocalStorage` for column visibility, `sortWithFavorites` + text filter, conditional `<th>`/`<td>` rendering based on visibility. Two-row header with "Resources" group spanning build cost columns.

### Mission Data Model
```ts
interface Mission {
  id: string;               // crypto.randomUUID()
  name: string;
  origin: string;           // location name, e.g. "Earth" or "Earth [Orbit]"
  target: string;
  manualResources: Record<string, number>;
  constructions: Record<string, number>;       // name → qty (costs resolved on the fly)
  transportableModules: Record<string, number>;
  spacecraft: Record<string, number>;
  launchVehicles: Record<string, number>;      // cleared when origin is orbit
}
```

### Orbit Naming Convention
Orbit locations use `"BodyName [Orbit]"` format (e.g. `"Earth [Orbit]"`). Detected via `.endsWith(' [Orbit]')`. Launch vehicles are hidden and cleared when origin is an orbit.

### Payload Mass Calculation
Total payload mass = sum of manual resources (1 unit = 1t) + construction build costs × qty + transportable module mass × qty. Compared against spacecraft cargo capacity and LV payload capacity.

### Resource Icons
12 PNG icons in `public/images/resources/`, mapped via `RESOURCE_ICONS` in `tableHelpers.tsx`. Use `ResourceIcon` component which renders `<img>` with `title` tooltip. Reference via `import.meta.env.BASE_URL` for correct path on gh-pages.

## Data Source

All game data is scraped from https://stockmaj.github.io/solar-expanse-wiki/. The scraper (`scripts/scrape-data.ts`) uses `node-html-parser` and native `fetch`. Key wiki pages:
- `/spacecraft/`, `/launch-vehicles/`, `/facilities/`, `/transportable-modules/` — construction data
- `/celestial-bodies/planets.html`, `moons.html`, `asteroids.html`, `comets.html`, `exoplanets.html` — location data
- Footer contains version string: `Solar Expanse v0.26.6.3.14 BETA`

Build cost cells use `<span title="ResourceName"><img .../> quantity</span>` — the `title` attribute is the resource name.

## Known Data Issues

- Duplicate item names exist (e.g. two "Probe" entries in transportable modules). React keys use `${name}-${index}` to handle this.
- Workers/energy fields are strings that may contain decimals (e.g. "0.5"). Use `parseFloat`, not `parseInt`.
