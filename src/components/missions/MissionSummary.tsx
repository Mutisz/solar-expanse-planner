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
import { borderLClass, tableClass, tdClass, thClass } from '../tableHelpers';

interface Props {
  mission: Mission;
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
}

function parseNum(s: string | undefined): number {
  const n = parseFloat(s ?? '');
  return isNaN(n) ? 0 : n;
}

export default function MissionSummary({
  mission,
  spacecraft,
  launchVehicles,
  groundFacilities,
  orbitalModules,
  transportableModules,
}: Props) {
  const allItems = new Map<string, { buildCost: Resources; workers?: string; energy?: string }>();
  for (const list of [spacecraft, launchVehicles, groundFacilities, orbitalModules, transportableModules]) {
    for (const item of list) {
      allItems.set(item.name, item as { buildCost: Resources; workers?: string; energy?: string });
    }
  }

  // --- Resources section (manual + construction-derived) ---
  interface ResourceRow {
    name: string;
    category: string;
    amount: number;
    resources: Resources;
    workers: number;
    energy: number;
  }

  const resourceRows: ResourceRow[] = [];

  for (const [r, amount] of Object.entries(mission.manualResources)) {
    if (amount > 0) {
      resourceRows.push({ name: r, category: 'Manual', amount, resources: { [r]: amount }, workers: 0, energy: 0 });
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
    resourceRows.push({ name, category: 'Construction', amount: qty, resources: scaled, workers: parseNum(item.workers), energy: parseNum(item.energy) });
  }

  const hasWorkers = resourceRows.some((r) => r.workers > 0);
  const hasEnergy = resourceRows.some((r) => r.energy > 0);
  const totalWorkers = resourceRows.reduce((s, r) => s + r.workers * r.amount, 0);
  const totalEnergy = resourceRows.reduce((s, r) => s + r.energy * r.amount, 0);
  const usedResources = ALL_RESOURCES.filter((r) => resourceRows.some((row) => (row.resources[r] ?? 0) > 0));
  const resourceTotals: Resources = {};
  for (const r of usedResources) {
    resourceTotals[r] = resourceRows.reduce((sum, row) => sum + (row.resources[r] ?? 0), 0);
  }

  // --- Modules section ---
  interface ModuleRow {
    name: string;
    qty: number;
    mass: number;
  }

  const moduleRows: ModuleRow[] = [];
  for (const [name, qty] of Object.entries(mission.transportableModules)) {
    if (qty <= 0) continue;
    const mod = transportableModules.find((m) => m.name === name);
    if (!mod) continue;
    moduleRows.push({ name, qty, mass: parseNum(mod.mass) });
  }
  const totalModuleMass = moduleRows.reduce((s, r) => s + r.mass * r.qty, 0);

  // --- Vehicles section ---
  interface VehicleRow {
    name: string;
    type: string;
    qty: number;
  }

  const vehicleRows: VehicleRow[] = [];
  for (const [name, qty] of Object.entries(mission.spacecraft)) {
    if (qty <= 0) continue;
    vehicleRows.push({ name, type: 'Spacecraft', qty });
  }
  for (const [name, qty] of Object.entries(mission.launchVehicles)) {
    if (qty <= 0) continue;
    vehicleRows.push({ name, type: 'Launch Vehicle', qty });
  }

  const hasNothing = resourceRows.length === 0 && moduleRows.length === 0 && vehicleRows.length === 0;

  if (hasNothing) {
    return <p className="text-sm text-gray-500 italic">Add payload or vehicles to see the summary.</p>;
  }

  const sectionHeading = 'text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2';

  return (
    <div className="space-y-6">
      {resourceRows.length > 0 && (
        <div>
          <h4 className={sectionHeading}>Resources</h4>
          <table className={tableClass}>
            <thead className="bg-gray-900">
              <tr>
                <th className={thClass} rowSpan={2}>Name</th>
                <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Qty</th>
                {hasWorkers && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Workers</th>}
                {hasEnergy && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Energy</th>}
                <th className={`${thClass} ${borderLClass} text-center`} colSpan={usedResources.length + 1}>Resources</th>
              </tr>
              <tr>
                {usedResources.map((r, i) => (
                  <th key={r} className={`${thClass}${i === 0 ? ` ${borderLClass}` : ''}`}>{r}</th>
                ))}
                <th className={thClass}>Total</th>
              </tr>
            </thead>
            <tbody>
              {resourceRows.map((row, i) => (
                <tr key={`${row.category}-${row.name}-${i}`} className="hover:bg-gray-900/50">
                  <td className={`${tdClass} font-medium text-gray-100`}>{row.name}</td>
                  <td className={`${tdClass} ${borderLClass} tabular-nums`}>{row.amount}</td>
                  {hasWorkers && (
                    <td className={`${tdClass} ${borderLClass} tabular-nums`}>
                      {row.workers > 0 ? row.workers * row.amount : '—'}
                    </td>
                  )}
                  {hasEnergy && (
                    <td className={`${tdClass} ${borderLClass} tabular-nums`}>
                      {row.energy > 0 ? row.energy * row.amount : '—'}
                    </td>
                  )}
                  {usedResources.map((r, i) => (
                    <td key={r} className={`${tdClass} tabular-nums${i === 0 ? ` ${borderLClass}` : ''}`}>
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
                <td className={`${tdClass} font-bold text-gray-100`} colSpan={2}>Total</td>
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
                {usedResources.map((r, i) => (
                  <td key={r} className={`${tdClass} tabular-nums font-bold text-amber-400${i === 0 ? ` ${borderLClass}` : ''}`}>
                    {resourceTotals[r] > 0 ? resourceTotals[r] : '—'}
                  </td>
                ))}
                <td className={`${tdClass} tabular-nums font-bold text-amber-400`}>
                  {Object.values(resourceTotals).reduce((a, b) => a + b, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {(moduleRows.length > 0 || vehicleRows.length > 0) && (
        <div className="flex gap-6">
          {moduleRows.length > 0 && (
            <div className="flex-1">
              <h4 className={sectionHeading}>Modules</h4>
              <table className={tableClass}>
                <thead className="bg-gray-900">
                  <tr>
                    <th className={thClass}>Name</th>
                    <th className={`${thClass} ${borderLClass}`}>Qty</th>
                    <th className={`${thClass} ${borderLClass}`}>Mass (t)</th>
                    <th className={`${thClass} ${borderLClass}`}>Total Mass (t)</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleRows.map((row, i) => (
                    <tr key={`${row.name}-${i}`} className="hover:bg-gray-900/50">
                      <td className={`${tdClass} font-medium text-gray-100`}>{row.name}</td>
                      <td className={`${tdClass} ${borderLClass} tabular-nums`}>{row.qty}</td>
                      <td className={`${tdClass} ${borderLClass} tabular-nums`}>{row.mass || '—'}</td>
                      <td className={`${tdClass} ${borderLClass} tabular-nums`}>{row.mass * row.qty || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-900 border-t-2 border-gray-600">
                    <td className={`${tdClass} font-bold text-gray-100`} colSpan={3}>Total</td>
                    <td className={`${tdClass} tabular-nums font-bold text-amber-400`}>
                      {totalModuleMass > 0 ? totalModuleMass : '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {vehicleRows.length > 0 && (
            <div className="flex-1">
              <h4 className={sectionHeading}>Vehicles</h4>
              <table className={tableClass}>
                <thead className="bg-gray-900">
                  <tr>
                    <th className={thClass}>Name</th>
                    <th className={`${thClass} ${borderLClass}`}>Type</th>
                    <th className={`${thClass} ${borderLClass}`}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleRows.map((row) => (
                    <tr key={`${row.type}-${row.name}`} className="hover:bg-gray-900/50">
                      <td className={`${tdClass} font-medium text-gray-100`}>{row.name}</td>
                      <td className={`${tdClass} ${borderLClass}`}>{row.type}</td>
                      <td className={`${tdClass} ${borderLClass} tabular-nums`}>{row.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
