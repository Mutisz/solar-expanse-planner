import type { HTMLElement as NHTMLElement } from 'node-html-parser';
import { parse } from 'node-html-parser';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Resources = Record<string, number>;

function parseCostCell(td: NHTMLElement): Resources {
  const result: Resources = {};
  for (const span of td.querySelectorAll('span[title]')) {
    const name = span.getAttribute('title')?.trim();
    if (!name) continue;
    // text content is the img alt + quantity, but node-html-parser excludes alt from .text
    // so .text gives e.g. " 240" or " 1000" (after the img tag)
    const raw = span.text.trim().replace(/[, ]/g, '');
    const qty = raw.endsWith('k') ? parseFloat(raw) * 1000 : parseFloat(raw);
    if (name && !isNaN(qty)) result[name] = qty;
  }
  return result;
}

function cellText(td: NHTMLElement): string {
  return td.text.trim().replace(/\s+/g, ' ');
}

function getTableTitle(table: NHTMLElement): string {
  let el = table.previousElementSibling;
  while (el) {
    const tag = el.tagName?.toLowerCase() ?? '';
    if (/^h[1-6]$/.test(tag)) return el.text.trim();
    el = el.previousElementSibling;
  }
  return '';
}

function parseRows(table: NHTMLElement) {
  const rows = table.querySelectorAll('tr');
  if (rows.length < 2) return { headers: [] as string[], cells: [] as NHTMLElement[][] };
  const headers = rows[0].querySelectorAll('th, td').map((c) => c.text.trim().toLowerCase());
  const cells = rows.slice(1).map((row) => row.querySelectorAll('td'));
  return { headers, cells };
}

function idx(headers: string[], needle: string) {
  return headers.findIndex((h) => h.includes(needle.toLowerCase()));
}

async function fetchDoc(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return parse(await res.text());
}

// ── Version ──────────────────────────────────────────────────────────────────

async function scrapeVersion(): Promise<{ version: string; generatedAt: string }> {
  const doc = await fetchDoc('https://stockmaj.github.io/solar-expanse-wiki/');
  // Footer text: "Data from Solar Expanse v0.26.6.3.14 BETA (generated 2026-06-14)."
  const footerText = doc.querySelector('footer')?.text ?? '';
  const version =
    footerText.match(/Solar Expanse (v[\d.]+(?:\s+\S+)?)\s*\(/)?.[1]?.trim() ?? 'unknown';
  const generatedAt = footerText.match(/generated (\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
  return { version, generatedAt };
}

// ── Spacecraft ───────────────────────────────────────────────────────────────

async function scrapeSpacecraft() {
  const doc = await fetchDoc('https://stockmaj.github.io/solar-expanse-wiki/spacecraft/');
  const result = [];
  for (const table of doc.querySelectorAll('table')) {
    const propulsionType = getTableTitle(table);
    const { headers, cells } = parseRows(table);
    const iName = 0;
    const iMass = idx(headers, 'mass');
    const iCargo = idx(headers, 'cargo');
    const iFuel = idx(headers, 'fuel');
    const iThrust = idx(headers, 'thrust');
    const iExhaust = idx(headers, 'exhaust');
    const iLifeSupport = idx(headers, 'life');
    const iReusable = idx(headers, 'reusable');
    const iBuiltAt = idx(headers, 'built');
    const iRequiresLV = idx(headers, 'requires');
    const iBuildCost = idx(headers, 'build cost');
    const iTime = idx(headers, 'time');
    const iDesc = idx(headers, 'description');
    for (const row of cells) {
      if (row.length < 3) continue;
      result.push({
        name: cellText(row[iName]),
        propulsionType,
        mass: cellText(row[iMass]),
        cargo: cellText(row[iCargo]),
        fuel: cellText(row[iFuel]),
        thrust: cellText(row[iThrust]),
        exhaustV: cellText(row[iExhaust]),
        lifeSupport: cellText(row[iLifeSupport]),
        reusable: cellText(row[iReusable]),
        builtAt: cellText(row[iBuiltAt]),
        requiresLV: cellText(row[iRequiresLV]),
        buildCost: parseCostCell(row[iBuildCost]),
        buildTime: parseInt(cellText(row[iTime]), 10) || 0,
        description: cellText(row[iDesc]),
      });
    }
  }
  return result;
}

// ── Launch Vehicles ──────────────────────────────────────────────────────────

async function scrapeLaunchVehicles() {
  const doc = await fetchDoc('https://stockmaj.github.io/solar-expanse-wiki/launch-vehicles/');
  const result = [];
  for (const table of doc.querySelectorAll('table')) {
    const propulsionType = getTableTitle(table);
    const { headers, cells } = parseRows(table);
    const isAlt = propulsionType.toLowerCase().includes('alternative');
    const iName = 0;
    const iBuildCost = idx(headers, 'build cost');
    const iTime = idx(headers, 'time');
    const iDesc = idx(headers, 'description');

    if (isAlt) {
      const iWorkers = idx(headers, 'worker');
      const iEnergy = idx(headers, 'energy');
      const iMaint = idx(headers, 'maint');
      const iLaunchBonus = idx(headers, 'bonus');
      const iPrereq = idx(headers, 'prereq');
      for (const row of cells) {
        if (row.length < 2) continue;
        result.push({
          name: cellText(row[iName]),
          propulsionType,
          payload: '',
          reusable: '',
          crew: '',
          maxG: '',
          launchCost: '',
          workers: iWorkers >= 0 ? cellText(row[iWorkers]) : '',
          energy: iEnergy >= 0 ? cellText(row[iEnergy]) : '',
          maintenance: iMaint >= 0 ? cellText(row[iMaint]) : '',
          launchBonus: iLaunchBonus >= 0 ? cellText(row[iLaunchBonus]) : '',
          prereq: iPrereq >= 0 ? cellText(row[iPrereq]) : '',
          buildCost: parseCostCell(row[iBuildCost]),
          buildTime: parseInt(cellText(row[iTime]), 10) || 0,
          description: cellText(row[iDesc]),
        });
      }
    } else {
      const iPayload = idx(headers, 'payload');
      const iReusable = idx(headers, 'reusable');
      const iCrew = idx(headers, 'crew');
      const iMaxG = idx(headers, 'max g');
      const iLaunchCost = idx(headers, 'launch');
      const iMaint = idx(headers, 'maint');
      for (const row of cells) {
        if (row.length < 2) continue;
        result.push({
          name: cellText(row[iName]),
          propulsionType,
          payload: iPayload >= 0 ? cellText(row[iPayload]) : '',
          reusable: iReusable >= 0 ? cellText(row[iReusable]) : '',
          crew: iCrew >= 0 ? cellText(row[iCrew]) : '',
          maxG: iMaxG >= 0 ? cellText(row[iMaxG]) : '',
          launchCost: iLaunchCost >= 0 ? cellText(row[iLaunchCost]) : '',
          maintenance: iMaint >= 0 ? cellText(row[iMaint]) : '',
          workers: '',
          energy: '',
          launchBonus: '',
          prereq: '',
          buildCost: parseCostCell(row[iBuildCost]),
          buildTime: parseInt(cellText(row[iTime]), 10) || 0,
          description: cellText(row[iDesc]),
        });
      }
    }
  }
  return result;
}

// ── Facilities ───────────────────────────────────────────────────────────────

async function scrapeFacilities() {
  const doc = await fetchDoc('https://stockmaj.github.io/solar-expanse-wiki/facilities/');
  const groundFacilities = [];
  const orbitalModules = [];
  for (const table of doc.querySelectorAll('table')) {
    const title = getTableTitle(table);
    const isOrbital = title.toLowerCase().includes('orbital');
    const { headers, cells } = parseRows(table);
    const iName = 0;
    const iType = idx(headers, 'type');
    const iBuildCost = idx(headers, 'build cost');
    const iTime = idx(headers, 'time');
    const iRole = idx(headers, 'role');
    const iWorkers = idx(headers, 'worker');
    const iEnergy = idx(headers, 'energy');
    const iMaint = idx(headers, 'maint');
    const iLaunchBonus = idx(headers, 'bonus');
    const iTerra = idx(headers, 'terra');
    const iHabitat = idx(headers, 'habitat');
    const iPrereq = idx(headers, 'prereq');
    const iDesc = idx(headers, 'description');

    for (const row of cells) {
      if (row.length < 2) continue;
      const base = {
        name: cellText(row[iName]),
        type: iType >= 0 ? cellText(row[iType]) : '',
        buildCost: parseCostCell(row[iBuildCost]),
        buildTime: parseInt(cellText(row[iTime]), 10) || 0,
        role: iRole >= 0 ? cellText(row[iRole]) : '',
        workers: iWorkers >= 0 ? cellText(row[iWorkers]) : '',
        energy: iEnergy >= 0 ? cellText(row[iEnergy]) : '',
        description: iDesc >= 0 ? cellText(row[iDesc]) : '',
      };
      if (isOrbital) {
        orbitalModules.push(base);
      } else {
        groundFacilities.push({
          ...base,
          maintenance: iMaint >= 0 ? cellText(row[iMaint]) : '',
          launchBonus: iLaunchBonus >= 0 ? cellText(row[iLaunchBonus]) : '',
          terraforming: iTerra >= 0 ? cellText(row[iTerra]) : '',
          habitatReq: iHabitat >= 0 ? cellText(row[iHabitat]) : '',
          prereq: iPrereq >= 0 ? cellText(row[iPrereq]) : '',
        });
      }
    }
  }
  return { groundFacilities, orbitalModules };
}

// ── Transportable Modules ────────────────────────────────────────────────────

async function scrapeTransportableModules() {
  const doc = await fetchDoc('https://stockmaj.github.io/solar-expanse-wiki/transportable-modules/');
  const result = [];
  for (const table of doc.querySelectorAll('table')) {
    const type = getTableTitle(table);
    const { headers, cells } = parseRows(table);
    const iName = 0;
    const iMass = idx(headers, 'mass');
    const iRole = idx(headers, 'role');
    const iBuildCost = idx(headers, 'build cost');
    const iTime = idx(headers, 'time');
    const iMaint = idx(headers, 'maint');
    const iDesc = idx(headers, 'description');
    for (const row of cells) {
      if (row.length < 2) continue;
      result.push({
        name: cellText(row[iName]),
        type,
        mass: iMass >= 0 ? cellText(row[iMass]) : '',
        role: iRole >= 0 ? cellText(row[iRole]) : '',
        buildCost: parseCostCell(row[iBuildCost]),
        buildTime: parseInt(cellText(row[iTime]), 10) || 0,
        maintenance: iMaint >= 0 ? cellText(row[iMaint]) : '',
        description: iDesc >= 0 ? cellText(row[iDesc]) : '',
      });
    }
  }
  return result;
}

// ── Celestial Bodies ─────────────────────────────────────────────────────────

const BODY_BASE = 'https://stockmaj.github.io/solar-expanse-wiki/celestial-bodies';

async function scrapeBodiesFromPage(
  url: string,
  type: string,
  nameHeader: string,
  hasMass: boolean,
) {
  const doc = await fetchDoc(url);
  const result: { name: string; type: string; group: string; mass: number | null }[] = [];
  for (const table of doc.querySelectorAll('table')) {
    const group = getTableTitle(table);
    const { headers, cells } = parseRows(table);
    const iName = idx(headers, nameHeader.toLowerCase());
    const iMass = hasMass ? idx(headers, 'mass') : -1;
    if (iName < 0) continue;
    for (const row of cells) {
      if (row.length < 2) continue;
      const name = cellText(row[iName]);
      if (!name) continue;
      let mass: number | null = null;
      if (iMass >= 0) {
        const raw = cellText(row[iMass]);
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) mass = parsed;
      }
      result.push({ name, type, group, mass });
    }
  }
  return result;
}

async function scrapeCelestialBodies() {
  const [planets, moons, asteroids, comets, exoplanets] = await Promise.all([
    scrapeBodiesFromPage(`${BODY_BASE}/planets.html`, 'planet', 'planet', true),
    scrapeBodiesFromPage(`${BODY_BASE}/moons.html`, 'moon', 'moon', true),
    scrapeBodiesFromPage(`${BODY_BASE}/asteroids.html`, 'asteroid', 'asteroid', false),
    scrapeBodiesFromPage(`${BODY_BASE}/comets.html`, 'comet', 'comet', false),
    scrapeBodiesFromPage(`${BODY_BASE}/exoplanets.html`, 'exoplanet', 'body', true),
  ]);
  return [...planets, ...moons, ...asteroids, ...comets, ...exoplanets];
}

// ── Write helpers ─────────────────────────────────────────────────────────────

function writeJson(paths: string[], data: unknown) {
  const json = JSON.stringify(data, null, 2);
  for (const p of paths) writeFileSync(p, json);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dataDir = resolve(import.meta.dirname, '../src/data');

  console.log('Fetching game version...');
  const { version, generatedAt } = await scrapeVersion();
  const sanitizedVersion = version.replace(/\s+/g, '_');
  const versionedDir = resolve(dataDir, sanitizedVersion);
  mkdirSync(versionedDir, { recursive: true });
  console.log(`  → ${version} (generated ${generatedAt})`);

  console.log('Scraping spacecraft...');
  const spacecraft = await scrapeSpacecraft();
  writeJson([`${versionedDir}/spacecraft.json`], spacecraft);
  console.log(`  → ${spacecraft.length} items`);

  console.log('Scraping launch vehicles...');
  const launchVehicles = await scrapeLaunchVehicles();
  writeJson([`${versionedDir}/launchVehicles.json`], launchVehicles);
  console.log(`  → ${launchVehicles.length} items`);

  console.log('Scraping facilities...');
  const { groundFacilities, orbitalModules } = await scrapeFacilities();
  writeJson([`${versionedDir}/groundFacilities.json`], groundFacilities);
  writeJson([`${versionedDir}/orbitalModules.json`], orbitalModules);
  console.log(`  → ${groundFacilities.length} ground facilities, ${orbitalModules.length} orbital modules`);

  console.log('Scraping transportable modules...');
  const transportableModules = await scrapeTransportableModules();
  writeJson([`${versionedDir}/transportableModules.json`], transportableModules);
  console.log(`  → ${transportableModules.length} items`);

  console.log('Scraping celestial bodies...');
  const celestialBodies = await scrapeCelestialBodies();
  writeJson([`${versionedDir}/celestialBodies.json`], celestialBodies);
  console.log(`  → ${celestialBodies.length} bodies`);

  writeFileSync(`${dataDir}/version.json`, JSON.stringify({ version, generatedAt }, null, 2));
  console.log(`Done. Data written to src/data/${sanitizedVersion}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
