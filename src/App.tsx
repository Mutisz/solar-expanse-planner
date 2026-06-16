import { useLocalStorage } from 'usehooks-ts';
import GroundFacilitiesTable from './components/GroundFacilitiesTable';
import LaunchVehiclesTable from './components/LaunchVehiclesTable';
import OrbitalModulesTable from './components/OrbitalModulesTable';
import SpacecraftTable from './components/SpacecraftTable';
import SummaryTable from './components/SummaryTable';
import TransportableModulesTable from './components/TransportableModulesTable';
import groundFacilitiesData from './data/groundFacilities.json';
import launchVehiclesData from './data/launchVehicles.json';
import orbitalModulesData from './data/orbitalModules.json';
import spacecraftData from './data/spacecraft.json';
import transportableModulesData from './data/transportableModules.json';
import type { GroundFacility, LaunchVehicle, OrbitalModule, Spacecraft, TransportableModule } from './types';

const spacecraft = spacecraftData as unknown as Spacecraft[];
const launchVehicles = launchVehiclesData as unknown as LaunchVehicle[];
const groundFacilities = groundFacilitiesData as unknown as GroundFacility[];
const orbitalModules = orbitalModulesData as unknown as OrbitalModule[];
const transportableModules = transportableModulesData as unknown as TransportableModule[];

const TABS = [
  { id: 'spacecraft', label: 'Spacecraft' },
  { id: 'launch-vehicles', label: 'Launch Vehicles' },
  { id: 'ground-facilities', label: 'Ground Facilities' },
  { id: 'orbital-modules', label: 'Orbital Modules' },
  { id: 'transportable-modules', label: 'Transportable Modules' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [activeTab, setActiveTab] = useLocalStorage<TabId>('active-tab', 'spacecraft');
  const [amounts, setAmounts] = useLocalStorage<Record<string, number>>('amounts', {});
  const [favorites, setFavorites] = useLocalStorage<Record<string, boolean>>('favorites', {});

  const safeAmounts = amounts ?? {};
  const safeFavorites = favorites ?? {};

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

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide text-amber-400">Solar Expanse Planner</h1>
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
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-amber-400 border border-b-0 border-gray-700'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active construction table */}
        <div className="overflow-x-auto">
          {activeTab === 'spacecraft' && (
            <SpacecraftTable
              data={spacecraft}
              amounts={safeAmounts}
              onAmountChange={handleAmountChange}
              favorites={safeFavorites}
              onFavoriteToggle={handleFavoriteToggle}
              onResetAmounts={() => resetFor(spacecraft)}
            />
          )}
          {activeTab === 'launch-vehicles' && (
            <LaunchVehiclesTable
              data={launchVehicles}
              amounts={safeAmounts}
              onAmountChange={handleAmountChange}
              favorites={safeFavorites}
              onFavoriteToggle={handleFavoriteToggle}
              onResetAmounts={() => resetFor(launchVehicles)}
            />
          )}
          {activeTab === 'ground-facilities' && (
            <GroundFacilitiesTable
              data={groundFacilities}
              amounts={safeAmounts}
              onAmountChange={handleAmountChange}
              favorites={safeFavorites}
              onFavoriteToggle={handleFavoriteToggle}
              onResetAmounts={() => resetFor(groundFacilities)}
            />
          )}
          {activeTab === 'orbital-modules' && (
            <OrbitalModulesTable
              data={orbitalModules}
              amounts={safeAmounts}
              onAmountChange={handleAmountChange}
              favorites={safeFavorites}
              onFavoriteToggle={handleFavoriteToggle}
              onResetAmounts={() => resetFor(orbitalModules)}
            />
          )}
          {activeTab === 'transportable-modules' && (
            <TransportableModulesTable
              data={transportableModules}
              amounts={safeAmounts}
              onAmountChange={handleAmountChange}
              favorites={safeFavorites}
              onFavoriteToggle={handleFavoriteToggle}
              onResetAmounts={() => resetFor(transportableModules)}
            />
          )}
        </div>

        {/* Always-visible summary */}
        <section>
          <h2 className="text-lg font-semibold text-gray-300 mb-3">Summary</h2>
          <div className="overflow-x-auto">
            <SummaryTable
              spacecraft={spacecraft}
              launchVehicles={launchVehicles}
              groundFacilities={groundFacilities}
              orbitalModules={orbitalModules}
              transportableModules={transportableModules}
              amounts={safeAmounts}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
