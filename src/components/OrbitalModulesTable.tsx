import type { OrbitalModule } from '../types';
import {
  AmountInput,
  FavoriteButton,
  ResourceCells,
  ResourceHeaders,
  resourcesForDataset,
  sortWithFavorites,
  tableClass,
  tdClass,
  thClass,
} from './tableHelpers';

interface Props {
  data: OrbitalModule[];
  amounts: Record<string, number>;
  onAmountChange: (name: string, value: number) => void;
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
  onResetAmounts: () => void;
}

export default function OrbitalModulesTable({ data, amounts, onAmountChange, favorites, onFavoriteToggle, onResetAmounts }: Props) {
  const resources = resourcesForDataset(data);
  const sorted = sortWithFavorites(data, favorites);
  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={onResetAmounts}
          className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 transition-colors"
        >
          Reset Qty
        </button>
      </div>
      <table className={tableClass}>
        <thead className="bg-gray-900">
          <tr>
            <th className={thClass}></th>
            <th className={thClass}>Qty</th>
            <th className={thClass}>Name</th>
            <th className={thClass}>Type</th>
            <th className={thClass}>Role</th>
            <th className={thClass}>Workers</th>
            <th className={thClass}>Energy</th>
            <th className={thClass}>Time (d)</th>
            <ResourceHeaders resources={resources} />
            <th className={thClass}>Description</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.name} className="hover:bg-gray-900/50">
              <td className={tdClass}>
                <FavoriteButton name={item.name} isFavorited={!!favorites[item.name]} onToggle={onFavoriteToggle} />
              </td>
              <td className={tdClass}>
                <AmountInput name={item.name} value={amounts[item.name] ?? 0} onChange={onAmountChange} />
              </td>
              <td className={`${tdClass} font-medium text-gray-100 whitespace-nowrap`}>{item.name}</td>
              <td className={tdClass}>{item.type || '—'}</td>
              <td className={tdClass}>{item.role || '—'}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{item.workers || '—'}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{item.energy || '—'}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{item.buildTime || '—'}</td>
              <ResourceCells cost={item.buildCost} resources={resources} />
              <td className={`${tdClass} max-w-xs text-gray-400 text-xs`}>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
