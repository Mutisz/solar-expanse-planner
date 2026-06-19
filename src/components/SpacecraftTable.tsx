import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import type { Spacecraft } from '../types';
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
  { key: 'propulsionType',label: 'Propulsion',         defaultOn: false },
  { key: 'mass',          label: 'Mass (t)',           defaultOn: true  },
  { key: 'cargo',         label: 'Cargo (t)',          defaultOn: true  },
  { key: 'fuel',          label: 'Fuel (t)',           defaultOn: false },
  { key: 'thrust',        label: 'Thrust',             defaultOn: false },
  { key: 'exhaustV',      label: 'Exhaust V',          defaultOn: false },
  { key: 'lifeSupport',   label: 'Life Support',       defaultOn: false },
  { key: 'reusable',      label: 'Reusable',           defaultOn: false },
  { key: 'builtAt',       label: 'Built At',           defaultOn: false },
  { key: 'requiresLV',    label: 'Req. LV',            defaultOn: false },
  { key: 'buildTime',     label: 'Time',               defaultOn: true  },
  { key: 'buildCost',     label: 'Construction Cost',  defaultOn: true  },
  { key: 'description',   label: 'Description',        defaultOn: false },
];

interface Props {
  data: Spacecraft[];
  amounts: Record<string, number>;
  onAmountChange: (name: string, value: number) => void;
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
  onResetAllAmounts: () => void;
  onResetAmounts: () => void;
}

export default function SpacecraftTable({ data, amounts, onAmountChange, favorites, onFavoriteToggle, onResetAllAmounts, onResetAmounts }: Props) {
  const resources = resourcesForDataset(data);
  const [filter, setFilter] = useState('');
  const sorted = sortWithFavorites(data, favorites);
  const filtered = filter ? sorted.filter((i) => i.name.toLowerCase().includes(filter.toLowerCase())) : sorted;
  const [visible, setVisible] = useLocalStorage('spacecraft-cols', defaultVisible(COLUMN_DEFS));
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
            {v.propulsionType && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Propulsion</th>}
            {v.mass           && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Mass (t)</th>}
            {v.cargo          && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Cargo (t)</th>}
            {v.fuel           && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Fuel (t)</th>}
            {v.thrust         && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Thrust</th>}
            {v.exhaustV       && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Exhaust V</th>}
            {v.lifeSupport    && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Life Support</th>}
            {v.reusable       && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Reusable</th>}
            {v.builtAt        && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Built At</th>}
            {v.requiresLV     && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Req. LV</th>}
            {v.buildTime      && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Time (d)</th>}
            {v.buildCost      && <th className={`${thClass} ${borderLClass} text-center`} colSpan={resources.length}>Resources</th>}
            {v.description    && <th className={`${thClass} ${borderLClass}`} rowSpan={2}>Description</th>}
          </tr>
          <tr>
            {v.buildCost && <ResourceHeaders resources={resources} />}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id} className="hover:bg-gray-900/50">
              <td className={tdClass}>
                <FavoriteButton id={item.id} isFavorited={!!favorites[item.id]} onToggle={onFavoriteToggle} />
              </td>
              <td className={tdClass}>
                <AmountInput id={item.id} value={amounts[item.id] ?? 0} onChange={onAmountChange} />
              </td>
              <td className={`${tdClass} font-medium text-gray-100 whitespace-nowrap`}>{item.name}</td>
              {v.propulsionType && <td className={`${tdClass} ${borderLClass}`}>{item.propulsionType}</td>}
              {v.mass           && <td className={`${tdClass} ${borderLClass} tabular-nums`}>{item.mass}</td>}
              {v.cargo          && <td className={`${tdClass} ${borderLClass} tabular-nums`}>{item.cargo}</td>}
              {v.fuel           && <td className={`${tdClass} ${borderLClass} tabular-nums`}>{item.fuel}</td>}
              {v.thrust         && <td className={`${tdClass} ${borderLClass}`}>{item.thrust}</td>}
              {v.exhaustV       && <td className={`${tdClass} ${borderLClass}`}>{item.exhaustV}</td>}
              {v.lifeSupport    && <td className={`${tdClass} ${borderLClass}`}>{item.lifeSupport}</td>}
              {v.reusable       && <td className={`${tdClass} ${borderLClass}`}>{item.reusable}</td>}
              {v.builtAt        && <td className={`${tdClass} ${borderLClass}`}>{item.builtAt}</td>}
              {v.requiresLV     && <td className={`${tdClass} ${borderLClass}`}>{item.requiresLV}</td>}
              {v.buildTime      && <td className={`${tdClass} ${borderLClass} tabular-nums`}>{item.buildTime || '—'}</td>}
              {v.buildCost      && <ResourceCells cost={item.buildCost} resources={resources} />}
              {v.description    && <td className={`${tdClass} ${borderLClass} max-w-xs text-gray-400 text-xs`}>{item.description}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
