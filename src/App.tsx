import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import GroundFacilitiesTable from './components/GroundFacilitiesTable';
import LaunchVehiclesTable from './components/LaunchVehiclesTable';
import MissionsView from './components/missions/MissionsView';
import OrbitalModulesTable from './components/OrbitalModulesTable';
import SpacecraftTable from './components/SpacecraftTable';
import SummaryTable from './components/SummaryTable';
import TransportableModulesTable from './components/TransportableModulesTable';
import versionData from './data/version.json';
import type {
  CelestialBody,
  GroundFacility,
  LaunchVehicle,
  Mission,
  OrbitalModule,
  Spacecraft,
  TransportableModule,
} from './types';

const spacecraftGlob = import.meta.glob<Spacecraft[]>('./data/*/spacecraft.json', { import: 'default' });
const launchVehiclesGlob = import.meta.glob<LaunchVehicle[]>('./data/*/launchVehicles.json', { import: 'default' });
const groundFacilitiesGlob = import.meta.glob<GroundFacility[]>('./data/*/groundFacilities.json', { import: 'default' });
const orbitalModulesGlob = import.meta.glob<OrbitalModule[]>('./data/*/orbitalModules.json', { import: 'default' });
const transportableModulesGlob = import.meta.glob<TransportableModule[]>('./data/*/transportableModules.json', {
  import: 'default',
});
const celestialBodiesGlob = import.meta.glob<CelestialBody[]>('./data/*/celestialBodies.json', { import: 'default' });

interface AppData {
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
  celestialBodies: CelestialBody[];
}

const TABS = [
  { id: 'spacecraft', label: 'Spacecraft', highlight: false },
  { id: 'launch-vehicles', label: 'Launch Vehicles', highlight: false },
  { id: 'ground-facilities', label: 'Ground Facilities', highlight: false },
  { id: 'orbital-modules', label: 'Orbital Modules', highlight: false },
  { id: 'transportable-modules', label: 'Transportable Modules', highlight: false },
  { id: 'missions', label: 'Missions', highlight: true },
  { id: 'summary', label: 'Summary', highlight: true },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [activeTab, setActiveTab] = useLocalStorage<TabId>('active-tab', 'spacecraft');
  const [amounts, setAmounts] = useLocalStorage<Record<string, number>>('amounts', {});
  const [favorites, setFavorites] = useLocalStorage<Record<string, boolean>>('favorites', {});
  const [missions, setMissions] = useLocalStorage<Mission[]>('missions', []);
  const [activeMissionId, setActiveMissionId] = useLocalStorage<string | null>('active-mission', null);
  const [data, setData] = useState<AppData | null>(null);

  const safeAmounts = amounts ?? {};
  const safeFavorites = favorites ?? {};
  const safeMissions = missions ?? [];

  useEffect(() => {
    const versionDir = versionData.version.replace(/\s+/g, '_');
    Promise.all([
      spacecraftGlob[`./data/${versionDir}/spacecraft.json`](),
      launchVehiclesGlob[`./data/${versionDir}/launchVehicles.json`](),
      groundFacilitiesGlob[`./data/${versionDir}/groundFacilities.json`](),
      orbitalModulesGlob[`./data/${versionDir}/orbitalModules.json`](),
      transportableModulesGlob[`./data/${versionDir}/transportableModules.json`](),
      celestialBodiesGlob[`./data/${versionDir}/celestialBodies.json`](),
    ]).then(([spacecraft, launchVehicles, groundFacilities, orbitalModules, transportableModules, celestialBodies]) => {
      setData({ spacecraft, launchVehicles, groundFacilities, orbitalModules, transportableModules, celestialBodies });
    });
  }, []);

  const handleAmountChange = (name: string, value: number) => {
    setAmounts((prev) => {
      const next = { ...(prev ?? {}) };
      if (value === 0) {
        delete next[name];
      } else {
        next[name] = value;
      }
      return next;
    });
  };

  const handleFavoriteToggle = (name: string) => {
    setFavorites((prev) => ({ ...(prev ?? {}), [name]: !(prev ?? {})[name] }));
  };

  const handleResetAll = () => setAmounts({});

  const resetFor = (items: { name: string }[]) => {
    setAmounts((prev) => {
      const next = { ...(prev ?? {}) };
      items.forEach((i) => delete next[i.name]);
      return next;
    });
  };

  const updateMission = (updated: Mission) => {
    setMissions((prev) => (prev ?? []).map((m) => (m.id === updated.id ? updated : m)));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="text-xl font-bold tracking-wide text-amber-400">Solar Expanse Planner</h1>
          <span className="text-xs text-gray-500">
            Game data: <span className="text-gray-400">{versionData.version}</span>
          </span>
        </div>
        <button
          onClick={handleResetAll}
          className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 transition-colors"
        >
          Reset All Qty
        </button>
      </header>

      <main className="px-6 py-4 space-y-6">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 border-b border-gray-800">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabClass = isActive
              ? tab.highlight
                ? 'bg-gray-800 text-amber-300 border border-b-0 border-amber-600'
                : 'bg-gray-800 text-amber-400 border border-b-0 border-gray-700'
              : tab.highlight
                ? 'text-amber-400 hover:text-amber-300 hover:bg-gray-900 border border-transparent'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${tabClass}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {!data ? (
          <div className="text-gray-500 text-sm py-8 text-center">Loading game data...</div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'spacecraft' && (
              <SpacecraftTable
                data={data.spacecraft}
                amounts={safeAmounts}
                onAmountChange={handleAmountChange}
                favorites={safeFavorites}
                onFavoriteToggle={handleFavoriteToggle}
                onResetAmounts={() => resetFor(data.spacecraft)}
              />
            )}
            {activeTab === 'launch-vehicles' && (
              <LaunchVehiclesTable
                data={data.launchVehicles}
                amounts={safeAmounts}
                onAmountChange={handleAmountChange}
                favorites={safeFavorites}
                onFavoriteToggle={handleFavoriteToggle}
                onResetAmounts={() => resetFor(data.launchVehicles)}
              />
            )}
            {activeTab === 'ground-facilities' && (
              <GroundFacilitiesTable
                data={data.groundFacilities}
                amounts={safeAmounts}
                onAmountChange={handleAmountChange}
                favorites={safeFavorites}
                onFavoriteToggle={handleFavoriteToggle}
                onResetAmounts={() => resetFor(data.groundFacilities)}
              />
            )}
            {activeTab === 'orbital-modules' && (
              <OrbitalModulesTable
                data={data.orbitalModules}
                amounts={safeAmounts}
                onAmountChange={handleAmountChange}
                favorites={safeFavorites}
                onFavoriteToggle={handleFavoriteToggle}
                onResetAmounts={() => resetFor(data.orbitalModules)}
              />
            )}
            {activeTab === 'transportable-modules' && (
              <TransportableModulesTable
                data={data.transportableModules}
                amounts={safeAmounts}
                onAmountChange={handleAmountChange}
                favorites={safeFavorites}
                onFavoriteToggle={handleFavoriteToggle}
                onResetAmounts={() => resetFor(data.transportableModules)}
              />
            )}
            {activeTab === 'missions' && (
              <MissionsView
                missions={safeMissions}
                activeMissionId={activeMissionId}
                onSetActiveMissionId={setActiveMissionId}
                onSetMissions={setMissions}
                onUpdateMission={updateMission}
                celestialBodies={data.celestialBodies}
                spacecraft={data.spacecraft}
                launchVehicles={data.launchVehicles}
                groundFacilities={data.groundFacilities}
                orbitalModules={data.orbitalModules}
                transportableModules={data.transportableModules}
                favorites={safeFavorites}
                onFavoriteToggle={handleFavoriteToggle}
              />
            )}
            {activeTab === 'summary' && (
              <SummaryTable
                spacecraft={data.spacecraft}
                launchVehicles={data.launchVehicles}
                groundFacilities={data.groundFacilities}
                orbitalModules={data.orbitalModules}
                transportableModules={data.transportableModules}
                amounts={safeAmounts}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
