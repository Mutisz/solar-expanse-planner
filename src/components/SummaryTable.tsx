import { ALL_RESOURCES } from '../types';
import type { GroundFacility, LaunchVehicle, OrbitalModule, Resources, Spacecraft, TransportableModule } from '../types';
import { tableClass, tdClass, thClass } from './tableHelpers';

type AnyItem = { name: string; buildCost: Resources };

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
}

interface Props {
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
  amounts: Record<string, number>;
}

function buildRows(items: AnyItem[], category: string, amounts: Record<string, number>): SummaryRow[] {
  return items
    .filter((item) => (amounts[item.name] ?? 0) > 0)
    .map((item) => ({
      name: item.name,
      category,
      amount: amounts[item.name],
      buildCost: item.buildCost,
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

  // Determine which resources are relevant (appear in any selected row)
  const usedResources = ALL_RESOURCES.filter((r) =>
    rows.some((row) => (row.buildCost[r] ?? 0) > 0),
  );

  // Compute totals
  const totals: Resources = {};
  for (const r of usedResources) {
    totals[r] = rows.reduce((sum, row) => sum + (row.buildCost[r] ?? 0) * row.amount, 0);
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Set a quantity on any construction above to see it here.
      </p>
    );
  }

  return (
    <table className={tableClass}>
      <thead className="bg-gray-900">
        <tr>
          <th className={thClass}>Name</th>
          <th className={thClass}>Category</th>
          <th className={`${thClass} text-right`}>Qty</th>
          {usedResources.map((r) => (
            <th key={r} className={`${thClass} text-right`}>
              {r}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.category}-${row.name}`} className="hover:bg-gray-900/50">
            <td className={`${tdClass} font-medium text-gray-100`}>{row.name}</td>
            <td className={tdClass}>{CATEGORY_LABEL[row.category]}</td>
            <td className={`${tdClass} text-right tabular-nums`}>{row.amount}</td>
            {usedResources.map((r) => (
              <td key={r} className={`${tdClass} text-right tabular-nums`}>
                {(row.buildCost[r] ?? 0) > 0 ? (row.buildCost[r] ?? 0) * row.amount : '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-gray-900 border-t-2 border-gray-600">
          <td className={`${tdClass} font-bold text-gray-100`} colSpan={3}>
            Total
          </td>
          {usedResources.map((r) => (
            <td key={r} className={`${tdClass} text-right tabular-nums font-bold text-amber-400`}>
              {totals[r] > 0 ? totals[r] : '—'}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
}
