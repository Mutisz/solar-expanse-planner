import type {
  CelestialBody,
  GroundFacility,
  LaunchVehicle,
  Mission,
  OrbitalModule,
  Spacecraft,
  TransportableModule,
} from '../../types';
import { createMission } from '../../types';
import MissionEditor from './MissionEditor';

interface Props {
  missions: Mission[];
  activeMissionId: string | null;
  onSetActiveMissionId: (id: string | null) => void;
  onSetMissions: (missions: Mission[]) => void;
  onUpdateMission: (mission: Mission) => void;
  celestialBodies: CelestialBody[];
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
}

export default function MissionsView({
  missions,
  activeMissionId,
  onSetActiveMissionId,
  onSetMissions,
  onUpdateMission,
  celestialBodies,
  spacecraft,
  launchVehicles,
  groundFacilities,
  orbitalModules,
  transportableModules,
  favorites,
  onFavoriteToggle,
}: Props) {
  const activeMission = missions.find((m) => m.id === activeMissionId) ?? null;

  const handleAdd = () => {
    const id = crypto.randomUUID();
    const newMission = createMission(id);
    onSetMissions([...missions, newMission]);
    onSetActiveMissionId(id);
  };

  const handleDelete = () => {
    if (!activeMissionId) return;
    const remaining = missions.filter((m) => m.id !== activeMissionId);
    onSetMissions(remaining);
    onSetActiveMissionId(remaining.length > 0 ? remaining[0].id : null);
  };

  const btnClass =
    'text-xs border border-gray-700 rounded px-3 py-1 transition-colors';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleAdd}
          className={`${btnClass} text-gray-400 hover:text-green-400 hover:border-green-700`}
        >
          + Add Mission
        </button>

        {missions.length > 0 && (
          <select
            value={activeMissionId ?? ''}
            onChange={(e) => onSetActiveMissionId(e.target.value || null)}
            className="rounded bg-gray-800 border border-gray-700 px-3 py-1 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
          >
            {missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || 'Unnamed Mission'}
              </option>
            ))}
          </select>
        )}

        {activeMission && (
          <button
            onClick={handleDelete}
            className={`${btnClass} text-gray-400 hover:text-red-400 hover:border-red-700`}
          >
            Delete Mission
          </button>
        )}
      </div>

      {activeMission ? (
        <MissionEditor
          mission={activeMission}
          onUpdate={onUpdateMission}
          celestialBodies={celestialBodies}
          spacecraft={spacecraft}
          launchVehicles={launchVehicles}
          groundFacilities={groundFacilities}
          orbitalModules={orbitalModules}
          transportableModules={transportableModules}
          favorites={favorites}
          onFavoriteToggle={onFavoriteToggle}
        />
      ) : (
        <p className="text-sm text-gray-500 italic py-4">
          Create a mission to get started.
        </p>
      )}
    </div>
  );
}
