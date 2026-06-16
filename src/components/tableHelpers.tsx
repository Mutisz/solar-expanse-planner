import type { Resources } from '../types';

export const thClass = 'px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap border-b border-gray-700';
export const tdClass = 'px-3 py-2 text-sm text-gray-300 border-b border-gray-800';
export const tdNumClass = 'px-3 py-2 text-sm text-gray-300 border-b border-gray-800 text-center tabular-nums';
export const tableClass = 'w-full border-collapse text-left';

export function ResourceCells({ cost, resources }: { cost: Resources; resources: readonly string[] }) {
  return (
    <>
      {resources.map((r) => (
        <td key={r} className={tdNumClass}>
          {cost[r] != null ? cost[r] : '—'}
        </td>
      ))}
    </>
  );
}

export function ResourceHeaders({ resources }: { resources: readonly string[] }) {
  return (
    <>
      {resources.map((r) => (
        <th key={r} className={thClass}>
          {r}
        </th>
      ))}
    </>
  );
}

export function AmountInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      step={1}
      value={value || ''}
      placeholder="0"
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        onChange(name, isNaN(v) || v < 0 ? 0 : Math.floor(v));
      }}
      className="w-16 rounded bg-gray-800 border border-gray-700 px-2 py-1 text-sm text-center text-gray-200 focus:outline-none focus:border-amber-500"
    />
  );
}

export function sortWithFavorites<T extends { name: string }>(items: T[], favorites: Record<string, boolean>): T[] {
  const cmp = (a: T, b: T) => a.name.localeCompare(b.name);
  return [
    ...items.filter((i) => favorites[i.name]).sort(cmp),
    ...items.filter((i) => !favorites[i.name]).sort(cmp),
  ];
}

export function FavoriteButton({
  name,
  isFavorited,
  onToggle,
}: {
  name: string;
  isFavorited: boolean;
  onToggle: (name: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(name)}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`text-base leading-none transition-colors ${isFavorited ? 'text-amber-400' : 'text-gray-600 hover:text-gray-400'}`}
    >
      {isFavorited ? '★' : '☆'}
    </button>
  );
}

export function resourcesForDataset(items: { buildCost: Resources }[]): string[] {
  const seen = new Set<string>();
  for (const item of items) {
    for (const key of Object.keys(item.buildCost)) seen.add(key);
  }
  // Return in canonical order
  const ORDER = ['Metals', 'Alloy', 'Glass', 'Polymers', 'Electronics', 'Rare Metals', 'Exotic Alloys', 'Fissiles', 'Supplies', 'Silicon', 'Water', 'Helium-3'];
  return ORDER.filter((r) => seen.has(r));
}
