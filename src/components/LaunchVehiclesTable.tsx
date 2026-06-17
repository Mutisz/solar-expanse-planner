import { useLocalStorage } from 'usehooks-ts';
import type { LaunchVehicle } from '../types';
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
  { key: 'payload',       label: 'Payload (t)',        defaultOn: true  },
  { key: 'reusable',      label: 'Reusable',           defaultOn: false },
  { key: 'crew',          label: 'Crew',               defaultOn: false },
  { key: 'maxG',          label: 'Max G',              defaultOn: false },
  { key: 'launchCost',    label: 'Launch Cost',        defaultOn: false },
  { key: 'maintenance',   label: 'Maint ($/mo)',       defaultOn: false },
  { key: 'workers',       label: 'Workers',            defaultOn: false },
  { key: 'energy',        label: 'Energy',             defaultOn: false },
  { key: 'launchBonus',   label: 'Launch Bonus',       defaultOn: false },
  { key: 'prereq',        label: 'Prereq',             defaultOn: false },
  { key: 'buildTime',     label: 'Time',               defaultOn: true  },
  { key: 'buildCost',     label: 'Construction Cost',  defaultOn: true  },
  { key: 'description',   label: 'Description',        defaultOn: false },
];

interface Props {
  data: LaunchVehicle[];
  amounts: Record<string, number>;
  onAmountChange: (name: string, value: number) => void;
  favorites: Record<string, boolean>;
  onFavoriteToggle: (name: string) => void;
  onResetAmounts: () => void;
}

export default function LaunchVehiclesTable({ data, amounts, onAmountChange, favorites, onFavoriteToggle, onResetAmounts }: Props) {
  const resources = resourcesForDataset(data);
  const sorted = sortWithFavorites(data, favorites);
  const [visible, setVisible] = useLocalStorage('launch-vehicles-cols', defaultVisible(COLUMN_DEFS));
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
            {v.propulsionType && <th className={thClass}>Propulsion</th>}
            {v.payload        && <th className={thClass}>Payload (t)</th>}
            {v.reusable       && <th className={thClass}>Reusable</th>}
            {v.crew           && <th className={thClass}>Crew</th>}
            {v.maxG           && <th className={thClass}>Max G</th>}
            {v.launchCost     && <th className={thClass}>Launch Cost</th>}
            {v.maintenance    && <th className={thClass}>Maint ($/mo)</th>}
            {v.workers        && <th className={thClass}>Workers</th>}
            {v.energy         && <th className={thClass}>Energy</th>}
            {v.launchBonus    && <th className={thClass}>Launch Bonus</th>}
            {v.prereq         && <th className={thClass}>Prereq</th>}
            {v.buildTime      && <th className={thClass}>Time (d)</th>}
            {v.buildCost      && <ResourceHeaders resources={resources} />}
            {v.description    && <th className={thClass}>Description</th>}
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
              {v.propulsionType && <td className={tdClass}>{item.propulsionType}</td>}
              {v.payload        && <td className={`${tdClass} tabular-nums`}>{item.payload || '—'}</td>}
              {v.reusable       && <td className={tdClass}>{item.reusable || '—'}</td>}
              {v.crew           && <td className={tdClass}>{item.crew || '—'}</td>}
              {v.maxG           && <td className={tdClass}>{item.maxG || '—'}</td>}
              {v.launchCost     && <td className={tdClass}>{item.launchCost || '—'}</td>}
              {v.maintenance    && <td className={`${tdClass} tabular-nums`}>{item.maintenance || '—'}</td>}
              {v.workers        && <td className={`${tdClass} tabular-nums`}>{item.workers || '—'}</td>}
              {v.energy         && <td className={`${tdClass} tabular-nums`}>{item.energy || '—'}</td>}
              {v.launchBonus    && <td className={tdClass}>{item.launchBonus || '—'}</td>}
              {v.prereq         && <td className={tdClass}>{item.prereq || '—'}</td>}
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
