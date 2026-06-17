import { useState } from 'react';
import type { GroundFacility, LaunchVehicle, OrbitalModule, Spacecraft, TransportableModule } from '../../types';
import ItemPicker from './ItemPicker';

const CATEGORIES = [
  { id: 'spacecraft', label: 'Spacecraft' },
  { id: 'launchVehicles', label: 'Launch Vehicles' },
  { id: 'groundFacilities', label: 'Ground Facilities' },
  { id: 'orbitalModules', label: 'Orbital Modules' },
  { id: 'transportableModules', label: 'Transportable Modules' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

interface Props {
  spacecraft: Spacecraft[];
  launchVehicles: LaunchVehicle[];
  groundFacilities: GroundFacility[];
  orbitalModules: OrbitalModule[];
  transportableModules: TransportableModule[];
  selected: Record<string, number>;
  onChange: (name: string, value: number) => void;
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
}

export default function ConstructionPicker({
  spacecraft,
  launchVehicles,
  groundFacilities,
  orbitalModules,
  transportableModules,
  selected,
  onChange,
  favorites,
  onFavoriteToggle,
}: Props) {
  const [category, setCategory] = useState<CategoryId>('spacecraft');

  const itemsMap: Record<CategoryId, { name: string }[]> = {
    spacecraft,
    launchVehicles,
    groundFacilities,
    orbitalModules,
    transportableModules,
  };

  const categorySelect = (
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value as CategoryId)}
      className="rounded bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
    >
      {CATEGORIES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  );

  return (
    <ItemPicker
      items={itemsMap[category]}
      selected={selected}
      onChange={onChange}
      favorites={favorites}
      onFavoriteToggle={onFavoriteToggle}
      headerSlot={categorySelect}
    />
  );
}
