'use client';

import type { WaterItem } from '@/lib/types';

const QUICK_VALUES = [50, 100, 150, 200];

interface Props {
  item: WaterItem;
  onUpdate: (ml: number | null) => void;
  accent?: 'amber' | 'blue';
}

export default function WaterInput({ item, onUpdate, accent = 'amber' }: Props) {
  const hasValue = item.ml !== null && item.ml > 0;

  return (
    <div className={`rounded-3xl border p-4 transition-all shadow-sm ${
      hasValue
        ? 'bg-sky-50 border-sky-200'
        : accent === 'amber'
        ? 'bg-white border-amber-100 hover:border-amber-200'
        : 'bg-white border-violet-100 hover:border-violet-200'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
          hasValue ? 'bg-sky-100' : 'bg-sky-50 border border-sky-100'
        }`}>
          💧
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-base ${hasValue ? 'text-sky-700' : 'text-gray-800'}`}>
              Água
            </span>
            {hasValue && (
              <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2.5 py-1 rounded-full">
                {item.ml} mL
              </span>
            )}
            {item.time && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                🕐 {item.time}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {QUICK_VALUES.map((val) => (
          <button
            key={val}
            onClick={() => onUpdate(item.ml === val ? null : val)}
            className={`py-3 rounded-2xl text-sm font-bold transition-all ${
              item.ml === val
                ? 'bg-sky-500 text-white shadow-md shadow-sky-100'
                : 'bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100'
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="999"
          step="10"
          placeholder="Outro valor..."
          value={item.ml ?? ''}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            onUpdate(isNaN(v) || v <= 0 ? null : v);
          }}
          className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white text-gray-700"
        />
        <span className="text-sm text-sky-400 font-bold pr-1">mL</span>
      </div>
    </div>
  );
}
