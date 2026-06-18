import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import type { TransportableModule } from '../types';
import { ColumnMenu, defaultVisible } from './ColumnMenu';
import type { ColumnDef } from './ColumnMenu';
import {
  AmountInput,
  FavoriteButton,
  ResourceCells,
  ResourceHeaders,
  resourcesForDataset,
  sortWithFavorites,
  borderLClass,
  tableClass,
  tdClass,
  thClass,
} from './tableHelpers';

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'type',        label: 'Type',              defaultOn: false },
  { key: 'mass',        label: 'Mass (t)',          defaultOn: true  },
  { key: 'role',        label: 'Role',              defaultOn: false },
  { key: 'maintenance', label: 'Maint ($/mo)',      defaultOn: false },
  { key: 'buildTime',   label: 'Time',              defaultOn: true  },
  { key: 'buildCost',   label: 'Construction Cost', defaultOn: true  },
  { key: 'description', label: 'Description',       defaultOn: false },
];

interface Props {
  data: TransportableModule[];
  amounts: Record<string, number>;
  onAmountChange: (name: string, value: number) => void;
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
  onResetAllAmounts: () => void;
  onResetAmounts: () => void;
}

export default function TransportableModulesTable({ data, amounts, onAmountChange, favorites, onFavoriteToggle, onResetAllAmounts, onResetAmounts }: Props) {
  const resources = resourcesForDataset(data);
  const [filter, setFilter] = useState('');
  const sorted = sortWithFavorites(data, favorites);
  const filtered = filter ? sorted.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase())) : sorted;
  const [visible, setVisible] = useLocalStorage('transportable-modules-cols', defaultVisible(COLUMN_DEFS));
  const v = visible ?? defaultVisible(COLUMN_DEFS);
  const toggleCol = (key: string, on: boolean) => setVisible((prev) => ({ ...(prev ?? {}), [key]: on }));

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input type="text" placeholder="Filter..." value={filter} onChange={(e) => setFilter(e.target.value)} className="mr-auto w-48 rounded bg-gray-800 border border-gray-700 px-3 py-1 text-sm text-gray-200 focus:outline-none focus:border-amber-500" />
        <ColumnMenu defs={COLUMN_DEFS} visible={v} onChange={toggleCol} />
        <button
          onClick={onResetAmounts}
          className="text-sm text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 transition-colors cursor-pointer"
        >
          Reset Qty
        </button>
        <button
          onClick={onResetAllAmounts}
          className="text-sm text-gray-400 hover:text-red-400 border border-gray-700 rounded px-3 py-1 transition-colors cursor-pointer"
        >
          Reset All Qty
        </button>
      </div>
      <table className={tableClass}>
        <thead className="bg-gray-900">
          <tr>
            <th className={thClass} rowSpan={2}></th>
            <th className={thClass} rowSpan={2}>Qty</th>
            <th className={thClass} rowSpan={2}>Name</th>
            {v.type        && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Type</th>}
            {v.mass        && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Mass (t)</th>}
            {v.role        && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Role</th>}
            {v.maintenance && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Maint ($/mo)</th>}
            {v.buildTime   && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Time (d)</th>}
            {v.buildCost   && <th className={`${thClass} ${borderLClass} text-center`} colSpan={resources.length}>Resources</th>}
            {v.description && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Description</th>}
          </tr>
          <tr>
            {v.buildCost && <ResourceHeaders resources={resources} />}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, i) => (
            <tr key={`${item.name}-${i}`} className="hover:bg-gray-900/50">
              <td className={tdClass}>
                <FavoriteButton name={item.name} isFavorited={!!favorites[item.name]} onToggle={onFavoriteToggle} />
              </td>
              <td className={tdClass}>
                <AmountInput name={item.name} value={amounts[item.name] ?? 0} onChange={onAmountChange} />
              </td>
              <td className={`${tdClass} font-medium text-gray-100 whitespace-nowrap`}>{item.name}</td>
              {v.type        && <td className={`${tdClass} ${borderLClass}`}>{item.type || '—'}</td>}
              {v.mass        && <td className={`${tdClass} ${borderLClass} tabular-nums`}>{item.mass || '—'}</td>}
              {v.role        && <td className={`${tdClass} ${borderLClass}`}>{item.role || '—'}</td>}
              {v.maintenance && <td className={`${tdClass} ${borderLClass} tabular-nums`}>{item.maintenance || '—'}</td>}
              {v.buildTime   && <td className={`${tdClass} ${borderLClass} tabular-nums`}>{item.buildTime || '—'}</td>}
              {v.buildCost   && <ResourceCells cost={item.buildCost} resources={resources} />}
              {v.description && <td className={`${tdClass} ${borderLClass} max-w-xs text-gray-400 text-xs`}>{item.description}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
