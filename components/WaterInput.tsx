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
    <div className={`rounded-2xl border p-4 transition-all ${
      hasValue
        ? 'bg-sky-50 border-sky-200'
        : accent === 'amber'
        ? 'bg-white border-amber-100'
        : 'bg-white border-blue-100'
    }`}>
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
          hasValue ? 'bg-sky-100' : 'bg-gray-50'
        }`}>
          💧
        </div>
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-base ${hasValue ? 'text-sky-700' : 'text-gray-700'}`}>
            Água
          </span>
          {hasValue && (
            <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2.5 py-1 rounded-full">
              {item.ml} mL
            </span>
          )}
          {item.time && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              🕐 {item.time}
            </span>
          )}
        </div>
      </div>

      {/* Botões rápidos */}
      <div className="flex gap-2 mb-2">
        {QUICK_VALUES.map((val) => (
          <button
            key={val}
            onClick={() => onUpdate(item.ml === val ? null : val)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              item.ml === val
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {val}
          </button>
        ))}
      </div>

      {/* Input livre */}
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
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200 bg-white"
        />
        <span className="text-sm text-gray-400 font-semibold pr-1">mL</span>
      </div>
    </div>
  );
}
