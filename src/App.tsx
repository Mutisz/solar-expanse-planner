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
import { createMission } from './types';

const spacecraftGlob = import.meta.glob<Spacecraft[]>('./data/*/spacecraft.json', { import: 'default' });
const launchVehiclesGlob = import.meta.glob<LaunchVehicle[]>('./data/*/launchVehicles.json', { import: 'default' });
const groundFacilitiesGlob = import.meta.glob<GroundFacility[]>('./data/*/groundFacilities.json', {
  import: 'default',
});
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

type ViewId = 'calculator' | 'mission-planner';

const CALC_TABS = [
  { id: 'spacecraft', label: 'Spacecraft', highlight: false },
  { id: 'launch-vehicles', label: 'Launch Vehicles', highlight: false },
  { id: 'ground-facilities', label: 'Ground Facilities', highlight: false },
  { id: 'orbital-modules', label: 'Orbital Modules', highlight: false },
  { id: 'transportable-modules', label: 'Transportable Modules', highlight: false },
  { id: 'summary', label: 'Summary', highlight: true },
] as const;

type CalcTabId = (typeof CALC_TABS)[number]['id'];

export default function App() {
  const [activeView, setActiveView] = useLocalStorage<ViewId>('active-view', 'calculator');
  const [activeCalcTab, setActiveCalcTab] = useLocalStorage<CalcTabId>('active-calc-tab', 'spacecraft');
  const [amounts, setAmounts] = useLocalStorage<Record<string, number>>('amounts', {});
  const [favorites, setFavorites] = useLocalStorage<Record<string, boolean>>('favorites', {});
  const [missions, setMissions] = useLocalStorage<Mission[]>('missions', []);
  const [activeMissionId, setActiveMissionId] = useLocalStorage<string | null>('active-mission', null);
  const [data, setData] = useState<AppData | null>(null);

  const safeView = activeView ?? 'calculator';
  const safeCalcTab = activeCalcTab ?? 'spacecraft';
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
      const withIds = <T,>(items: T[], prefix: string) =>
        items.map((item, i) => ({ ...item, id: `${prefix}-${i}` }));
      setData({
        spacecraft: withIds(spacecraft, 'sc'),
        launchVehicles: withIds(launchVehicles, 'lv'),
        groundFacilities: withIds(groundFacilities, 'gf'),
        orbitalModules: withIds(orbitalModules, 'om'),
        transportableModules: withIds(transportableModules, 'tm'),
        celestialBodies,
      });
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

  const resetFor = (items: { id: string }[]) => {
    setAmounts((prev) => {
      const next = { ...(prev ?? {}) };
      items.forEach((i) => delete next[i.id]);
      return next;
    });
  };

  const updateMission = (updated: Mission) => {
    setMissions((prev) => (prev ?? []).map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleCopyToMission = (missionId: string, constructions: Record<string, number>) => {
    setMissions((prev) =>
      (prev ?? []).map((m) => {
        if (m.id !== missionId) return m;
        const merged = { ...m.constructions };
        for (const [name, qty] of Object.entries(constructions)) {
          merged[name] = (merged[name] ?? 0) + qty;
        }
        return { ...m, constructions: merged };
      }),
    );
    setActiveMissionId(missionId);
    setActiveView('mission-planner');
  };

  const handleCopyToNewMission = (constructions: Record<string, number>) => {
    const id = crypto.randomUUID();
    const mission = { ...createMission(id), constructions };
    setMissions((prev) => [...(prev ?? []), mission]);
    setActiveMissionId(id);
    setActiveView('mission-planner');
  };

  const viewBtnClass = (id: ViewId) =>
    safeView === id
      ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
      : 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header>
        <div className="max-w-[2560px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <h1 className="text-xl font-bold tracking-wide text-amber-400">Solar Expanse Planner</h1>
            <span className="text-xs text-gray-500">
              Game data: <span className="text-gray-400">{versionData.version}</span>
              {' · Based on data from '}
              <a
                href="https://stockmaj.github.io/solar-expanse-wiki/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 underline"
              >
                unofficial fan wiki
              </a>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[2560px] mx-auto px-6 py-4 space-y-4">
        {/* View switcher */}
        <div className="flex gap-6 border-b border-gray-800 pb-0">
          <button
            onClick={() => setActiveView('calculator')}
            className={`pb-2 text-sm tracking-wide uppercase transition-colors cursor-pointer ${viewBtnClass('calculator')}`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveView('mission-planner')}
            className={`pb-2 text-sm tracking-wide uppercase transition-colors cursor-pointer ${viewBtnClass('mission-planner')}`}
          >
            Mission Planner
          </button>
        </div>

        {!data ? (
          <div className="text-gray-500 text-sm py-8 text-center">Loading game data...</div>
        ) : safeView === 'calculator' ? (
          <>
            {/* Sub-tab bar */}
            <div className="flex flex-wrap gap-1 border-b border-gray-800">
              {CALC_TABS.map((tab) => {
                const isActive = safeCalcTab === tab.id;
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
                    onClick={() => setActiveCalcTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-t transition-colors cursor-pointer ${tabClass}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto">
              {safeCalcTab === 'spacecraft' && (
                <SpacecraftTable
                  data={data.spacecraft}
                  amounts={safeAmounts}
                  onAmountChange={handleAmountChange}
                  favorites={safeFavorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  onResetAllAmounts={handleResetAll}
                  onResetAmounts={() => resetFor(data.spacecraft)}
                />
              )}
              {safeCalcTab === 'launch-vehicles' && (
                <LaunchVehiclesTable
                  data={data.launchVehicles}
                  amounts={safeAmounts}
                  onAmountChange={handleAmountChange}
                  favorites={safeFavorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  onResetAllAmounts={handleResetAll}
                  onResetAmounts={() => resetFor(data.launchVehicles)}
                />
              )}
              {safeCalcTab === 'ground-facilities' && (
                <GroundFacilitiesTable
                  data={data.groundFacilities}
                  amounts={safeAmounts}
                  onAmountChange={handleAmountChange}
                  favorites={safeFavorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  onResetAllAmounts={handleResetAll}
                  onResetAmounts={() => resetFor(data.groundFacilities)}
                />
              )}
              {safeCalcTab === 'orbital-modules' && (
                <OrbitalModulesTable
                  data={data.orbitalModules}
                  amounts={safeAmounts}
                  onAmountChange={handleAmountChange}
                  favorites={safeFavorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  onResetAllAmounts={handleResetAll}
                  onResetAmounts={() => resetFor(data.orbitalModules)}
                />
              )}
              {safeCalcTab === 'transportable-modules' && (
                <TransportableModulesTable
                  data={data.transportableModules}
                  amounts={safeAmounts}
                  onAmountChange={handleAmountChange}
                  favorites={safeFavorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  onResetAllAmounts={handleResetAll}
                  onResetAmounts={() => resetFor(data.transportableModules)}
                />
              )}
              {safeCalcTab === 'summary' && (
                <SummaryTable
                  spacecraft={data.spacecraft}
                  launchVehicles={data.launchVehicles}
                  groundFacilities={data.groundFacilities}
                  orbitalModules={data.orbitalModules}
                  transportableModules={data.transportableModules}
                  amounts={safeAmounts}
                  missions={safeMissions}
                  onCopyToMission={handleCopyToMission}
                  onCopyToNewMission={handleCopyToNewMission}
                />
              )}
            </div>
          </>
        ) : (
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
      </main>
    </div>
  );
}
