import { useState } from 'react';
import type {
  CelestialBody,
  GroundFacility,
  LaunchVehicle,
  Mission,
  OrbitalModule,
  Spacecraft,
  TransportableModule,
} from '../../types';
import MissionSummary from './MissionSummary';
import PayloadSection from './PayloadSection';
import VehicleSection from './VehicleSection';

interface Props {
  mission: Mission;
  onUpdate: (mission: Mission) => void;
  celestialBodies: CelestialBody[];
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
}

type SectionId = 'payload' | 'vehicles' | 'summary';

const BODY_TYPE_LABELS: Record<string, string> = {
  planet: 'Planets',
  moon: 'Moons',
  asteroid: 'Asteroids',
  comet: 'Comets',
  exoplanet: 'Exoplanets',
};

const BODY_TYPE_ORDER = ['planet', 'moon', 'asteroid', 'comet', 'exoplanet'];

function buildLocationGroups(bodies: CelestialBody[]) {
  const groups: Record<string, { name: string; isOrbit: boolean }[]> = {};
  for (const type of BODY_TYPE_ORDER) groups[type] = [];

  for (const body of bodies) {
    if (!groups[body.type]) groups[body.type] = [];
    groups[body.type].push({ name: body.name, isOrbit: false });
    if (body.mass !== null) {
      groups[body.type].push({ name: `${body.name} [Orbit]`, isOrbit: true });
    }
  }
  return groups;
}

export default function MissionEditor({
  mission,
  onUpdate,
  celestialBodies,
  spacecraft,
  launchVehicles,
  groundFacilities,
  orbitalModules,
  transportableModules,
  favorites,
  onFavoriteToggle,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>({
    payload: true,
    vehicles: false,
    summary: false,
  });

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const locationGroups = buildLocationGroups(celestialBodies);

  const selectClass =
    'rounded bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500';
  const sectionHeaderClass =
    'flex items-center gap-2 text-sm font-semibold text-gray-300 cursor-pointer select-none py-2';

  const locationSelect = (value: string, onChange: (v: string) => void, label: string) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${selectClass}`}>
        <option value="">Select {label.toLowerCase()}...</option>
        {BODY_TYPE_ORDER.map((type) => {
          const locs = locationGroups[type];
          if (!locs || locs.length === 0) return null;
          return (
            <optgroup key={type} label={BODY_TYPE_LABELS[type] ?? type}>
              {locs.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mission Name</label>
          <input
            type="text"
            value={mission.name}
            onChange={(e) => onUpdate({ ...mission, name: e.target.value })}
            placeholder="Unnamed Mission"
            className={`w-full ${selectClass}`}
          />
        </div>
        {locationSelect(mission.origin, (v) => onUpdate({ ...mission, origin: v }), 'Origin')}
        {locationSelect(mission.target, (v) => onUpdate({ ...mission, target: v }), 'Target')}
      </div>

      <div className="border border-gray-800 rounded">
        <button onClick={() => toggleSection('payload')} className={`${sectionHeaderClass} px-3 w-full`}>
          <span className="text-gray-500">{openSections.payload ? '▾' : '▸'}</span>
          Payload
        </button>
        {openSections.payload && (
          <div className="px-3 pb-3">
            <PayloadSection
              mission={mission}
              onUpdate={onUpdate}
              spacecraft={spacecraft}
              launchVehicles={launchVehicles}
              groundFacilities={groundFacilities}
              orbitalModules={orbitalModules}
              transportableModules={transportableModules}
              favorites={favorites}
              onFavoriteToggle={onFavoriteToggle}
            />
          </div>
        )}
      </div>

      <div className="border border-gray-800 rounded">
        <button onClick={() => toggleSection('vehicles')} className={`${sectionHeaderClass} px-3 w-full`}>
          <span className="text-gray-500">{openSections.vehicles ? '▾' : '▸'}</span>
          Vehicles
        </button>
        {openSections.vehicles && (
          <div className="px-3 pb-3">
            <VehicleSection
              mission={mission}
              onUpdate={onUpdate}
              spacecraft={spacecraft}
              launchVehicles={launchVehicles}
              transportableModules={transportableModules}
              favorites={favorites}
              onFavoriteToggle={onFavoriteToggle}
            />
          </div>
        )}
      </div>

      <div className="border border-gray-800 rounded">
        <button onClick={() => toggleSection('summary')} className={`${sectionHeaderClass} px-3 w-full`}>
          <span className="text-gray-500">{openSections.summary ? '▾' : '▸'}</span>
          Summary
        </button>
        {openSections.summary && (
          <div className="px-3 pb-3 overflow-x-auto">
            <MissionSummary
              mission={mission}
              spacecraft={spacecraft}
              launchVehicles={launchVehicles}
              groundFacilities={groundFacilities}
              orbitalModules={orbitalModules}
              transportableModules={transportableModules}
            />
          </div>
        )}
      </div>
    </div>
  );
}
