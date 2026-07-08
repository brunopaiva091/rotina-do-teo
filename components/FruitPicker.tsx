'use client';

import StarRating from './StarRating';
import type { FruitItem } from '@/lib/types';

const FRUITS = [
  'Banana', 'Maçã', 'Pera', 'Ameixa', 'Abacate', 'Goiaba',
  'Mamão', 'Melancia', 'Melão', 'Pitaya', 'Abacaxi', 'Laranja',
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
  return (
    <div className={`rounded-2xl border transition-all ${
      item.done
        ? 'bg-green-50 border-green-200'
        : accent === 'amber'
        ? 'bg-white border-amber-100 hover:border-amber-300'
        : 'bg-white border-blue-100 hover:border-blue-300'
    }`}>
      {/* Linha principal */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            item.done
              ? 'bg-green-500 border-green-500 text-white shadow-sm'
              : 'border-gray-300 hover:border-green-400 bg-white'
          }`}
          aria-label={item.done ? 'Desmarcar' : 'Marcar como feito'}
        >
          {item.done && <span className="text-base font-bold">✓</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-base ${item.done ? 'text-green-700' : 'text-gray-700'}`}>
              {label}
            </span>
            {item.time && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                🕐 {item.time}
              </span>
            )}
          </div>
          {item.fruits.length > 0 && (
            <p className="text-xs text-green-600 font-medium mt-0.5">
              {item.fruits.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Picker de frutas + estrelas (só aparece quando marcado) */}
      {item.done && (
        <div className="px-4 pb-4 space-y-4">
          {/* Seleção de frutas */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">Qual fruta?</p>
            <div className="flex flex-wrap gap-2">
              {FRUITS.map((fruit) => {
                const selected = item.fruits.includes(fruit);
                return (
                  <button
                    key={fruit}
                    onClick={() => onFruitToggle(fruit)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      selected
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {fruit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estrelas */}
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Como o Téo aceitou?</p>
            <StarRating stars={item.stars} onChange={onRate} />
          </div>
        </div>
      )}
    </div>
  );
}
