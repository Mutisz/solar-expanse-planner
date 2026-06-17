import type {
  GroundFacility,
  LaunchVehicle,
  Mission,
  OrbitalModule,
  Resources,
  Spacecraft,
  TransportableModule,
} from '../../types';
import { ALL_RESOURCES } from '../../types';
import { tableClass, tdClass, thClass } from '../tableHelpers';

interface Props {
  mission: Mission;
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
}

interface SummaryRow {
  name: string;
  category: string;
  amount: number;
  resources: Resources;
  workers: number;
}

function parseNum(s: string | undefined): number {
  const n = parseInt(s ?? '', 10);
  return isNaN(n) ? 0 : n;
}

const CATEGORY_LABELS: Record<string, string> = {
  manualResource: 'Manual Resource',
  construction: 'Construction',
  transportableModule: 'Transportable Module',
  spacecraft: 'Spacecraft',
  launchVehicle: 'Launch Vehicle',
};

export default function MissionSummary({
  mission,
  spacecraft,
  launchVehicles,
  groundFacilities,
  orbitalModules,
  transportableModules,
}: Props) {
  const allItems = new Map<string, { buildCost: Resources; workers?: string }>();
  for (const list of [spacecraft, launchVehicles, groundFacilities, orbitalModules, transportableModules]) {
    for (const item of list) {
      allItems.set(item.name, item as { buildCost: Resources; workers?: string });
    }
  }

  const rows: SummaryRow[] = [];

  for (const [r, amount] of Object.entries(mission.manualResources)) {
    if (amount > 0) {
      rows.push({ name: r, category: 'manualResource', amount, resources: { [r]: amount }, workers: 0 });
    }
  }

  for (const [name, qty] of Object.entries(mission.constructions)) {
    if (qty <= 0) continue;
    const item = allItems.get(name);
    if (!item) continue;
    const scaled: Resources = {};
    for (const [r, cost] of Object.entries(item.buildCost)) {
      scaled[r] = cost * qty;
    }
    rows.push({ name, category: 'construction', amount: qty, resources: scaled, workers: parseNum(item.workers) });
  }

  for (const [name, qty] of Object.entries(mission.transportableModules)) {
    if (qty <= 0) continue;
    const mod = transportableModules.find((m) => m.name === name);
    if (!mod) continue;
    const scaled: Resources = {};
    for (const [r, cost] of Object.entries(mod.buildCost)) {
      scaled[r] = cost * qty;
    }
    rows.push({ name, category: 'transportableModule', amount: qty, resources: scaled, workers: 0 });
  }

  for (const [name, qty] of Object.entries(mission.spacecraft)) {
    if (qty <= 0) continue;
    const sc = spacecraft.find((s) => s.name === name);
    if (!sc) continue;
    const scaled: Resources = {};
    for (const [r, cost] of Object.entries(sc.buildCost)) {
      scaled[r] = cost * qty;
    }
    rows.push({ name, category: 'spacecraft', amount: qty, resources: scaled, workers: 0 });
  }

  for (const [name, qty] of Object.entries(mission.launchVehicles)) {
    if (qty <= 0) continue;
    const lv = launchVehicles.find((l) => l.name === name);
    if (!lv) continue;
    const scaled: Resources = {};
    for (const [r, cost] of Object.entries(lv.buildCost)) {
      scaled[r] = cost * qty;
    }
    rows.push({ name, category: 'launchVehicle', amount: qty, resources: scaled, workers: parseNum(lv.workers) });
  }

  const hasWorkers = rows.some((r) => r.workers > 0);
  const totalWorkers = rows.reduce((s, r) => s + r.workers * r.amount, 0);

  const usedResources = ALL_RESOURCES.filter((r) => rows.some((row) => (row.resources[r] ?? 0) > 0));

  const totals: Resources = {};
  for (const r of usedResources) {
    totals[r] = rows.reduce((sum, row) => sum + (row.resources[r] ?? 0), 0);
  }

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 italic">Add payload or vehicles to see the summary.</p>;
  }

  return (
    <table className={tableClass}>
      <thead className="bg-gray-900">
        <tr>
          <th className={thClass}>Name</th>
          <th className={thClass}>Category</th>
          <th className={thClass}>Qty</th>
          {hasWorkers && <th className={thClass}>Workers</th>}
          {usedResources.map((r) => (
            <th key={r} className={thClass}>
              {r}
            </th>
          ))}
          <th className={thClass}>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`${row.category}-${row.name}-${i}`} className="hover:bg-gray-900/50">
            <td className={`${tdClass} font-medium text-gray-100`}>{row.name}</td>
            <td className={tdClass}>{CATEGORY_LABELS[row.category]}</td>
            <td className={`${tdClass} tabular-nums`}>{row.amount}</td>
            {hasWorkers && (
              <td className={`${tdClass} tabular-nums`}>
                {row.workers > 0 ? row.workers * row.amount : '—'}
              </td>
            )}
            {usedResources.map((r) => (
              <td key={r} className={`${tdClass} tabular-nums`}>
                {(row.resources[r] ?? 0) > 0 ? row.resources[r] : '—'}
              </td>
            ))}
            <td className={`${tdClass} tabular-nums font-medium text-gray-100`}>
              {usedResources.reduce((sum, r) => sum + (row.resources[r] ?? 0), 0)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-gray-900 border-t-2 border-gray-600">
          <td className={`${tdClass} font-bold text-gray-100`} colSpan={3}>
            Total
          </td>
          {hasWorkers && (
            <td className={`${tdClass} tabular-nums font-bold text-amber-400`}>
              {totalWorkers > 0 ? totalWorkers : '—'}
            </td>
          )}
          {usedResources.map((r) => (
            <td key={r} className={`${tdClass} tabular-nums font-bold text-amber-400`}>
              {totals[r] > 0 ? totals[r] : '—'}
            </td>
          ))}
          <td className={`${tdClass} tabular-nums font-bold text-amber-400`}>
            {Object.values(totals).reduce((a, b) => a + b, 0)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
