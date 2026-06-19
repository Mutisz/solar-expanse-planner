import type { Resources } from '../types';

export const thClass = 'px-3 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap border-b border-gray-700';
export const tdClass = 'px-3 py-2 text-sm text-gray-300 border-b border-gray-800';
export const tdNumClass = 'px-3 py-2 text-sm text-gray-300 border-b border-gray-800 tabular-nums';
export const tableClass = 'w-full border-collapse text-left';
export const borderLClass = 'border-l border-gray-700';
export const borderRClass = 'border-r border-gray-700';

export function ResourceCells({ cost, resources }: { cost: Resources; resources: readonly string[] }) {
  return (
    <>
      {resources.map((r, i) => (
        <td key={r} className={`${tdNumClass}${i === 0 ? ` ${borderLClass}` : ''}`}>
          {cost[r] != null ? cost[r] : '—'}
        </td>
      ))}
    </>
  );
}

export function ResourceHeaders({ resources }: { resources: readonly string[] }) {
  return (
    <>
      {resources.map((r, i) => (
        <th key={r} className={`${thClass}${i === 0 ? ` ${borderLClass}` : ''}`}>
          {r}
        </th>
      ))}
    </>
  );
}

export function AmountInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (id: string, value: number) => void;
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
        onChange(id, isNaN(v) || v < 0 ? 0 : Math.floor(v));
      }}
      className="w-16 rounded bg-gray-800 border border-gray-700 px-2 py-1 text-sm text-center text-gray-200 focus:outline-none focus:border-amber-500"
    />
  );
}

export function sortWithFavorites<T extends { id: string; name: string }>(items: T[], favorites: Record<string, boolean>): T[] {
  const cmp = (a: T, b: T) => a.name.localeCompare(b.name);
  return [
    ...items.filter((i) => favorites[i.id]).sort(cmp),
    ...items.filter((i) => !favorites[i.id]).sort(cmp),
  ];
}

export function FavoriteButton({
  id,
  isFavorited,
  onToggle,
}: {
  id: string;
  isFavorited: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(id)}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`text-xl leading-none transition-all cursor-pointer hover:scale-125 ${isFavorited ? 'text-amber-400 hover:text-amber-300' : 'text-gray-600 hover:text-amber-400'}`}
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