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
            <th className={thClass}></th>
            <th className={thClass}>Qty</th>
            <th className={thClass}>Name</th>
            {v.propulsionType && <th className={thClass}>Propulsion</th>}
            {v.mass           && <th className={thClass}>Mass (t)</th>}
            {v.cargo          && <th className={thClass}>Cargo (t)</th>}
            {v.fuel           && <th className={thClass}>Fuel (t)</th>}
            {v.thrust         && <th className={thClass}>Thrust</th>}
            {v.exhaustV       && <th className={thClass}>Exhaust V</th>}
            {v.lifeSupport    && <th className={thClass}>Life Support</th>}
            {v.reusable       && <th className={thClass}>Reusable</th>}
            {v.builtAt        && <th className={thClass}>Built At</th>}
            {v.requiresLV     && <th className={thClass}>Req. LV</th>}
            {v.buildTime      && <th className={thClass}>Time (d)</th>}
            {v.buildCost      && <ResourceHeaders resources={resources} />}
            {v.description    && <th className={thClass}>Description</th>}
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
              {v.propulsionType && <td className={tdClass}>{item.propulsionType}</td>}
              {v.mass           && <td className={`${tdClass} tabular-nums`}>{item.mass}</td>}
              {v.cargo          && <td className={`${tdClass} tabular-nums`}>{item.cargo}</td>}
              {v.fuel           && <td className={`${tdClass} tabular-nums`}>{item.fuel}</td>}
              {v.thrust         && <td className={tdClass}>{item.thrust}</td>}
              {v.exhaustV       && <td className={tdClass}>{item.exhaustV}</td>}
              {v.lifeSupport    && <td className={tdClass}>{item.lifeSupport}</td>}
              {v.reusable       && <td className={tdClass}>{item.reusable}</td>}
              {v.builtAt        && <td className={tdClass}>{item.builtAt}</td>}
              {v.requiresLV     && <td className={tdClass}>{item.requiresLV}</td>}
              {v.buildTime      && <td className={`${tdClass} tabular-nums`}>{item.buildTime || '—'}</td>}
              {v.buildCost      && <ResourceCells cost={item.buildCost} resources={resources} />}
              {v.description    && <td className={`${tdClass} max-w-xs text-gray-400 text-xs`}>{item.description}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
