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
  onResetAmounts: () => void;
}

export default function TransportableModulesTable({ data, amounts, onAmountChange, favorites, onFavoriteToggle, onResetAmounts }: Props) {
  const resources = resourcesForDataset(data);
  const sorted = sortWithFavorites(data, favorites);
  const [visible, setVisible] = useLocalStorage('transportable-modules-cols', defaultVisible(COLUMN_DEFS));
  const v = visible ?? defaultVisible(COLUMN_DEFS);
  const toggleCol = (key: string, on: boolean) => setVisible((prev) => ({ ...(prev ?? {}), [key]: on }));

  return (
    <div>
      <div className="flex justify-end gap-2 mb-2">
        <ColumnMenu defs={COLUMN_DEFS} visible={v} onChange={toggleCol} />
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
            {v.type        && <th className={thClass}>Type</th>}
            {v.mass        && <th className={thClass}>Mass (t)</th>}
            {v.role        && <th className={thClass}>Role</th>}
            {v.maintenance && <th className={thClass}>Maint ($/mo)</th>}
            {v.buildTime   && <th className={thClass}>Time (d)</th>}
            {v.buildCost   && <ResourceHeaders resources={resources} />}
            {v.description && <th className={thClass}>Description</th>}
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
              {v.type        && <td className={tdClass}>{item.type || '—'}</td>}
              {v.mass        && <td className={`${tdClass} text-center tabular-nums`}>{item.mass || '—'}</td>}
              {v.role        && <td className={tdClass}>{item.role || '—'}</td>}
              {v.maintenance && <td className={`${tdClass} text-center tabular-nums`}>{item.maintenance || '—'}</td>}
              {v.buildTime   && <td className={`${tdClass} text-center tabular-nums`}>{item.buildTime || '—'}</td>}
              {v.buildCost   && <ResourceCells cost={item.buildCost} resources={resources} />}
              {v.description && <td className={`${tdClass} max-w-xs text-gray-400 text-xs`}>{item.description}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
