import type {
  GroundFacility,
  LaunchVehicle,
  Mission,
  OrbitalModule,
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

    </div>
  );
}
