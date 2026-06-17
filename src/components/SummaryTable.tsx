import { ALL_RESOURCES } from '../types';
import type { GroundFacility, LaunchVehicle, OrbitalModule, Resources, Spacecraft, TransportableModule } from '../types';
import { tableClass, tdClass, thClass } from './tableHelpers';

type AnyItem = { name: string; buildCost: Resources; workers?: string; energy?: string };

const CATEGORY_LABEL: Record<string, string> = {
  spacecraft: 'Spacecraft',
  launchVehicle: 'Launch Vehicle',
  groundFacility: 'Ground Facility',
  orbitalModule: 'Orbital Module',
  transportableModule: 'Transportable Module',
};

interface SummaryRow {
  name: string;
  category: string;
  amount: number;
  buildCost: Resources;
  workers: number;
  energy: number;
}

interface Props {
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
  amounts: Record<string, number>;
}

function parseNum(s: string | undefined): number {
  const n = parseInt(s ?? '', 10);
  return isNaN(n) ? 0 : n;
}

function buildRows(items: AnyItem[], category: string, amounts: Record<string, number>): SummaryRow[] {
  return items
    .filter((item) => (amounts[item.name] ?? 0) > 0)
    .map((item) => ({
      name: item.name,
      category,
      amount: amounts[item.name],
      buildCost: item.buildCost,
      workers: parseNum(item.workers),
      energy: parseNum(item.energy),
    }));
}

export default function SummaryTable({ spacecraft, launchVehicles, groundFacilities, orbitalModules, transportableModules, amounts }: Props) {
  const rows: SummaryRow[] = [
    ...buildRows(spacecraft, 'spacecraft', amounts),
    ...buildRows(launchVehicles, 'launchVehicle', amounts),
    ...buildRows(groundFacilities, 'groundFacility', amounts),
    ...buildRows(orbitalModules, 'orbitalModule', amounts),
    ...buildRows(transportableModules, 'transportableModule', amounts),
  ];

  const hasWorkers = rows.some((r) => r.workers > 0);
  const hasEnergy = rows.some((r) => r.energy > 0);

  const usedResources = ALL_RESOURCES.filter((r) =>
    rows.some((row) => (row.buildCost[r] ?? 0) > 0),
  );

  const totals: Resources = {};
  for (const r of usedResources) {
    totals[r] = rows.reduce((sum, row) => sum + (row.buildCost[r] ?? 0) * row.amount, 0);
  }

  const totalWorkers = rows.reduce((s, r) => s + r.workers * r.amount, 0);
  const totalEnergy = rows.reduce((s, r) => s + r.energy * r.amount, 0);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Set a quantity on any construction tab to see it here.
      </p>
    );
  }

  return (
    <table className={tableClass}>
      <thead className="bg-gray-900">
        <tr>
          <th className={thClass}>Name</th>
          <th className={thClass}>Category</th>
          <th className={`${thClass}`}>Qty</th>
          {hasWorkers && <th className={`${thClass}`}>Workers</th>}
          {hasEnergy && <th className={`${thClass}`}>Energy</th>}
          {usedResources.map((r) => (
            <th key={r} className={`${thClass}`}>
              {r}
            </th>
          ))}
          <th className={`${thClass}`}>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.category}-${row.name}`} className="hover:bg-gray-900/50">
            <td className={`${tdClass} font-medium text-gray-100`}>{row.name}</td>
            <td className={tdClass}>{CATEGORY_LABEL[row.category]}</td>
            <td className={`${tdClass} tabular-nums`}>{row.amount}</td>
            {hasWorkers && (
              <td className={`${tdClass} tabular-nums`}>
                {row.workers > 0 ? row.workers * row.amount : '—'}
              </td>
            )}
            {hasEnergy && (
              <td className={`${tdClass} tabular-nums`}>
                {row.energy > 0 ? row.energy * row.amount : '—'}
              </td>
            )}
            {usedResources.map((r) => (
              <td key={r} className={`${tdClass} tabular-nums`}>
                {(row.buildCost[r] ?? 0) > 0 ? (row.buildCost[r] ?? 0) * row.amount : '—'}
              </td>
            ))}
            <td className={`${tdClass} tabular-nums font-medium text-gray-100`}>
              {usedResources.reduce((sum, r) => sum + (row.buildCost[r] ?? 0) * row.amount, 0)}
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
          {hasEnergy && (
            <td className={`${tdClass} tabular-nums font-bold text-amber-400`}>
              {totalEnergy > 0 ? totalEnergy : '—'}
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
