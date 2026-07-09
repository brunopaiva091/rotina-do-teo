'use client';

import StarRating from './StarRating';
import type { FruitItem } from '@/lib/types';

const FRUITS = [
  { name: 'Banana', emoji: '🍌' },
  { name: 'Maçã', emoji: '🍎' },
  { name: 'Pera', emoji: '🍐' },
  { name: 'Ameixa', emoji: '🍑' },
  { name: 'Abacate', emoji: '🥑' },
  { name: 'Goiaba', emoji: '🍈' },
  { name: 'Mamão', emoji: '🥭' },
  { name: 'Melancia', emoji: '🍉' },
  { name: 'Melão', emoji: '🍋' },
  { name: 'Pitaya', emoji: '🌸' },
  { name: 'Abacaxi', emoji: '🍍' },
  { name: 'Laranja', emoji: '🍊' },
];

interface Props {
  item: FruitItem;
  label: string;
  onToggle: () => void;
  onFruitToggle: (fruit: string) => void;
  onRate: (stars: number) => void;
  accent?: 'amber' | 'blue';
}

export default function FruitPicker({ item, label, onToggle, onFruitToggle, onRate, accent = 'amber' }: Props) {
  const borderIdle = accent === 'amber'
    ? 'border-amber-100 hover:border-amber-300'
    : 'border-violet-100 hover:border-violet-300';
  const checkIdle = accent === 'amber'
    ? 'bg-amber-50 border-amber-200 hover:border-amber-400'
    : 'bg-violet-50 border-violet-200 hover:border-violet-400';

  return (
    <div className={`rounded-3xl border transition-all shadow-sm ${
      item.done ? 'bg-emerald-50 border-emerald-100' : `bg-white ${borderIdle}`
    }`}>
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            item.done
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100'
              : checkIdle
          }`}
          aria-label={item.done ? 'Desmarcar' : 'Marcar como feito'}
        >
          {item.done && <span className="text-lg font-bold">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-base ${item.done ? 'text-emerald-700' : 'text-gray-800'}`}>
              {label}
            </span>
            {item.time && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                🕐 {item.time}
              </span>
            )}
          </div>
          {item.fruits.length > 0 && (
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">
              {item.fruits.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {item.done && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <p className="text-xs text-gray-400 font-bold mb-2.5 uppercase tracking-widest">Qual fruta?</p>
            <div className="grid grid-cols-3 gap-2">
              {FRUITS.map(({ name, emoji }) => {
                const selected = item.fruits.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => onFruitToggle(name)}
                    className={`flex flex-col items-center gap-1 py-3 px-1 rounded-2xl font-semibold transition-all ${
                      selected
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs leading-tight">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-widest">Como o Téo aceitou?</p>
            <StarRating stars={item.stars} onChange={onRate} />
          </div>
        </div>
      )}
    </div>
  );
}
