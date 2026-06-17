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
import ConstructionPicker from './ConstructionPicker';
import ItemPicker from './ItemPicker';

interface Props {
  mission: Mission;
  onUpdate: (mission: Mission) => void;
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
}

export default function PayloadSection({
  mission,
  onUpdate,
  spacecraft,
  launchVehicles,
  groundFacilities,
  orbitalModules,
  transportableModules,
  favorites,
  onFavoriteToggle,
}: Props) {
  const handleResourceChange = (resource: string, value: number) => {
    const next = { ...mission.manualResources };
    if (value === 0) {
      delete next[resource];
    } else {
      next[resource] = value;
    }
    onUpdate({ ...mission, manualResources: next });
  };

  const handleConstructionChange = (name: string, value: number) => {
    const next = { ...mission.constructions };
    if (value === 0) {
      delete next[name];
    } else {
      next[name] = value;
    }
    onUpdate({ ...mission, constructions: next });
  };

  const handleModuleChange = (name: string, value: number) => {
    const next = { ...mission.transportableModules };
    if (value === 0) {
      delete next[name];
    } else {
      next[name] = value;
    }
    onUpdate({ ...mission, transportableModules: next });
  };

  const allConstructions = new Map<string, { buildCost: Resources }>();
  for (const list of [spacecraft, launchVehicles, groundFacilities, orbitalModules, transportableModules]) {
    for (const item of list) {
      allConstructions.set(item.name, item);
    }
  }

  const constructionResources: Record<string, number> = {};
  for (const [name, qty] of Object.entries(mission.constructions)) {
    const item = allConstructions.get(name);
    if (!item) continue;
    for (const [r, cost] of Object.entries(item.buildCost)) {
      constructionResources[r] = (constructionResources[r] ?? 0) + cost * qty;
    }
  }

  const totalResources: Record<string, number> = { ...mission.manualResources };
  for (const [r, amount] of Object.entries(constructionResources)) {
    totalResources[r] = (totalResources[r] ?? 0) + amount;
  }

  const hasConstructionResources = Object.keys(constructionResources).length > 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Resources - manual</h4>
          <button onClick={() => onUpdate({ ...mission, manualResources: {} })} className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 transition-colors cursor-pointer">Reset Qty</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1">
          {ALL_RESOURCES.map((r) => (
            <div key={r} className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={1}
                value={mission.manualResources[r] || ''}
                placeholder="0"
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  handleResourceChange(r, isNaN(v) || v < 0 ? 0 : Math.floor(v));
                }}
                className="w-20 rounded bg-gray-800 border border-gray-700 px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
              />
              <label className="text-xs text-gray-400">{r}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Resources - for construction</h4>
          <button onClick={() => onUpdate({ ...mission, constructions: {} })} className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 transition-colors cursor-pointer">Reset Qty</button>
        </div>
        <ConstructionPicker
          spacecraft={spacecraft}
          launchVehicles={launchVehicles}
          groundFacilities={groundFacilities}
          orbitalModules={orbitalModules}
          transportableModules={transportableModules}
          selected={mission.constructions}
          onChange={handleConstructionChange}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
        />
      </div>

      {hasConstructionResources && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Construction-derived Resources
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            {Object.entries(constructionResources)
              .filter(([, v]) => v > 0)
              .map(([r, v]) => (
                <span key={r}>
                  {r}: {v}
                </span>
              ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Modules</h4>
          <button onClick={() => onUpdate({ ...mission, transportableModules: {} })} className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 transition-colors cursor-pointer">Reset Qty</button>
        </div>
        <ItemPicker
          items={transportableModules}
          selected={mission.transportableModules}
          onChange={handleModuleChange}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
        />
      </div>

      {Object.values(totalResources).some((v) => v > 0) && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Total Payload Resources
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-400">
            {ALL_RESOURCES.filter((r) => (totalResources[r] ?? 0) > 0).map((r) => (
              <span key={r}>
                {r}: {totalResources[r]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
