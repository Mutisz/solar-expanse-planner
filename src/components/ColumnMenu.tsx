import { useEffect, useRef, useState } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
  defaultOn: boolean;
}

export function defaultVisible(defs: ColumnDef[]): Record<string, boolean> {
  return Object.fromEntries(defs.map((d) => [d.key, d.defaultOn]));
}

interface Props {
  defs: ColumnDef[];
  visible: Record<string, boolean>;
  onChange: (key: string, on: boolean) => void;
}

export function ColumnMenu({ defs, visible, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 rounded px-3 py-1 transition-colors cursor-pointer"
      >
        Columns ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-gray-900 border border-gray-700 rounded shadow-xl p-3 min-w-[180px]">
          {defs.map((def) => (
            <label key={def.key} className="flex items-center gap-2 text-sm text-gray-300 py-0.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visible[def.key] ?? def.defaultOn}
                onChange={(e) => onChange(def.key, e.target.checked)}
                className="accent-amber-400"
              />
              {def.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
