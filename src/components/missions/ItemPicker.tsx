import { useState } from 'react';
import { AmountInput, FavoriteButton, sortWithFavorites } from '../tableHelpers';

interface Props {
  items: { id: string; name: string }[];
  allItems?: { id: string; name: string }[];
  selected: Record<string, number>;
  onChange: (id: string, value: number) => void;
  favorites: Record<string, boolean>;
  onFavoriteToggle: (id: string) => void;
  headerSlot?: React.ReactNode;
}

export default function ItemPicker({ items, allItems, selected, onChange, favorites, onFavoriteToggle, headerSlot }: Props) {
  const [filter, setFilter] = useState('');

  const sorted = sortWithFavorites(items, favorites);
  const filtered = filter
    ? sorted.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase()))
    : sorted;

  const nameById = new Map((allItems ?? items).map((i) => [i.id, i.name]));
  const selectedEntries = Object.entries(selected)
    .filter(([, qty]) => qty > 0)
    .sort(([a], [b]) => (nameById.get(a) ?? a).localeCompare(nameById.get(b) ?? b));

  return (
    <div className="flex gap-4">
      <div className="basis-1/2 space-y-2">
        <div className="flex gap-2">
          {headerSlot}
          <input
            type="text"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-48 rounded bg-gray-800 border border-gray-700 px-3 py-1 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-2 py-0.5">
              <FavoriteButton
                id={item.id}
                isFavorited={!!favorites[item.id]}
                onToggle={onFavoriteToggle}
              />
              <AmountInput
                id={item.id}
                value={selected[item.id] ?? 0}
                onChange={onChange}
              />
              <span className="flex-1 text-sm text-gray-300 truncate">{item.name}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-gray-500 italic py-2">No items match filter.</p>
          )}
        </div>
      </div>

      <div className="basis-1/2 space-y-2">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide py-1 border border-transparent">Selected</p>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {selectedEntries.length > 0 ? (
            selectedEntries.map(([id]) => (
              <div key={id} className="flex items-center gap-2 py-0.5">
                <AmountInput
                  id={id}
                  value={selected[id] ?? 0}
                  onChange={onChange}
                />
                <span className="flex-1 text-sm text-gray-300 truncate">{nameById.get(id) ?? id}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic py-2">Nothing selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
