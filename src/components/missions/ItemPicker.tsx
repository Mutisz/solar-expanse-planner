import { useState } from 'react';
import { AmountInput, FavoriteButton, sortWithFavorites } from '../tableHelpers';

interface Props {
  items: { name: string }[];
  selected: Record<string, number>;
  onChange: (name: string, value: number) => void;
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
  headerSlot?: React.ReactNode;
}

export default function ItemPicker({ items, selected, onChange, favorites, onFavoriteToggle, headerSlot }: Props) {
  const [filter, setFilter] = useState('');

  const sorted = sortWithFavorites(items, favorites);
  const filtered = filter
    ? sorted.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase()))
    : sorted;

  const selectedEntries = Object.entries(selected)
    .filter(([, qty]) => qty > 0)
    .sort(([a], [b]) => a.localeCompare(b));

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
          {filtered.map((item, i) => (
            <div key={`${item.name}-${i}`} className="flex items-center gap-2 py-0.5">
              <FavoriteButton
                name={item.name}
                isFavorited={!!favorites[item.name]}
                onToggle={onFavoriteToggle}
              />
              <AmountInput
                name={item.name}
                value={selected[item.name] ?? 0}
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
            selectedEntries.map(([name]) => (
              <div key={name} className="flex items-center gap-2 py-0.5">
                <AmountInput
                  name={name}
                  value={selected[name] ?? 0}
                  onChange={onChange}
                />
                <span className="flex-1 text-sm text-gray-300 truncate">{name}</span>
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
