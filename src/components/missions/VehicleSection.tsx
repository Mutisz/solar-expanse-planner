import type { LaunchVehicle, Mission, Spacecraft, TransportableModule } from '../../types';
import ItemPicker from './ItemPicker';

interface Props {
  mission: Mission;
  onUpdate: (mission: Mission) => void;
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  transportableModules: TransportableModule[];
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
}

function parseNum(s: string): number {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

export default function VehicleSection({
  mission,
  onUpdate,
  spacecraft,
  launchVehicles,
  transportableModules,
  favorites,
  onFavoriteToggle,
}: Props) {
  const isOrbitOrigin = mission.origin.endsWith(' [Orbit]');

  const handleSpacecraftChange = (name: string, value: number) => {
    const next = { ...mission.spacecraft };
    if (value === 0) {
      delete next[name];
    } else {
      next[name] = value;
    }
    onUpdate({ ...mission, spacecraft: next });
  };

  const handleLVChange = (name: string, value: number) => {
    const next = { ...mission.launchVehicles };
    if (value === 0) {
      delete next[name];
    } else {
      next[name] = value;
    }
    onUpdate({ ...mission, launchVehicles: next });
  };

  const payloadMass = Object.entries(mission.transportableModules).reduce((sum, [name, qty]) => {
    const mod = transportableModules.find((m) => m.name === name);
    return sum + (mod ? parseNum(mod.mass) * qty : 0);
  }, 0);

  const scCapacity = Object.entries(mission.spacecraft).reduce((sum, [name, qty]) => {
    const sc = spacecraft.find((s) => s.name === name);
    return sum + (sc ? parseNum(sc.cargo) * qty : 0);
  }, 0);

  const lvCapacity = Object.entries(mission.launchVehicles).reduce((sum, [name, qty]) => {
    const lv = launchVehicles.find((l) => l.name === name);
    return sum + (lv ? parseNum(lv.payload) * qty : 0);
  }, 0);

  const scOverage = payloadMass - scCapacity;
  const lvOverage = payloadMass - lvCapacity;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Spacecraft</h4>
        <ItemPicker
          items={spacecraft}
          selected={mission.spacecraft}
          onChange={handleSpacecraftChange}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
        />
        {scCapacity > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Cargo capacity: {scCapacity} t | Payload mass: {payloadMass} t
          </p>
        )}
        {scOverage > 0 && (
          <p className="text-xs text-red-400 mt-1">
            Payload exceeds spacecraft cargo by {scOverage} t
          </p>
        )}
      </div>

      {!isOrbitOrigin && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Launch Vehicles
          </h4>
          <ItemPicker
            items={launchVehicles}
            selected={mission.launchVehicles}
            onChange={handleLVChange}
            favorites={favorites}
            onFavoriteToggle={onFavoriteToggle}
          />
          {lvCapacity > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Launch capacity: {lvCapacity} t | Payload mass: {payloadMass} t
            </p>
          )}
          {lvOverage > 0 && (
            <p className="text-xs text-red-400 mt-1">
              Payload exceeds launch vehicle capacity by {lvOverage} t
            </p>
          )}
        </div>
      )}
    </div>
  );
}
