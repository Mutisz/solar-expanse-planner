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

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {headerSlot}
        <input
          type="text"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-48 rounded bg-gray-800 border border-gray-700 px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
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
  );
}
