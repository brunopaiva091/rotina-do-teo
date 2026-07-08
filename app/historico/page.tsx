import Link from 'next/link';
import { listDays, getDay } from '@/lib/storage';
import type { DayRecord, ExerciseId } from '@/lib/types';

function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

const EXERCISE_IDS: ExerciseId[] = ['ex1', 'ex2', 'ex3'];
const EXERCISE_NAMES: Record<ExerciseId, string> = {
  ex1: 'Perninha (2x15)',
  ex2: 'Engatinhando',
  ex3: 'Perninha (5 min)',
};

function Stars({ stars }: { stars: number }) {
  if (!stars) return null;
  return (
    <span className="ml-1 text-yellow-400 text-xs">
      {'★'.repeat(stars)}<span className="text-gray-200">{'★'.repeat(5 - stars)}</span>
    </span>
  );
}

function DayCard({ record }: { record: DayRecord }) {
  const { morning: m, afternoon: a } = record;

  const exDoneM = EXERCISE_IDS.filter((id) => m.exercises[id].done).length;
  const exDoneA = EXERCISE_IDS.filter((id) => a.exercises[id].done).length;

  const allItems = [
    m.medicines.kollis.done, m.medicines.ferro.done, m.medicines.vitaminaD.done,
    !!m.water.ml, m.fruit.done,
    ...EXERCISE_IDS.map((id) => m.exercises[id].done),
    a.lunch.done, !!a.water.ml, a.fruit.done,
    ...EXERCISE_IDS.map((id) => a.exercises[id].done),
  ];
  const doneCount = allItems.filter(Boolean).length;
  const total = allItems.length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-gray-800 capitalize">{formatDateLong(record.date)}</p>
          <p className="text-xs text-gray-400">{record.date}</p>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${pct === 100 ? 'text-green-500' : pct >= 60 ? 'text-amber-500' : 'text-gray-400'}`}>
            {pct}%
          </span>
          <p className="text-xs text-gray-400">{doneCount}/{total} itens</p>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div
          className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-400' : pct >= 60 ? 'bg-amber-400' : 'bg-gray-300'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        {/* Manhã */}
        <div>
          <p className="font-bold text-amber-600 uppercase tracking-wide mb-2">🌅 Manhã</p>
          <ul className="space-y-1">
            <li>{m.medicines.kollis.done ? '✅' : '⬜'} Kollis</li>
            <li>{m.medicines.ferro.done ? '✅' : '⬜'} Ferro</li>
            <li>{m.medicines.vitaminaD.done ? '✅' : '⬜'} Vitamina D</li>
            <li>
              {m.water.ml ? '✅' : '⬜'} Água
              {m.water.ml && <span className="ml-1 text-sky-600 font-bold">{m.water.ml} mL</span>}
            </li>
            <li>
              {m.fruit.done ? '✅' : '⬜'} Fruta
              {m.fruit.fruits.length > 0 && <span className="ml-1 text-green-600">{m.fruit.fruits.join(', ')}</span>}
              <Stars stars={m.fruit.stars} />
            </li>
            <li className="font-medium text-gray-500 mt-1">Exercícios ({exDoneM}/3):</li>
            {EXERCISE_IDS.map((id) => (
              <li key={id} className="pl-2">
                {m.exercises[id].done ? '✅' : '⬜'} {EXERCISE_NAMES[id]}
                <Stars stars={m.exercises[id].stars} />
              </li>
            ))}
          </ul>
        </div>

        {/* Tarde */}
        <div>
          <p className="font-bold text-blue-600 uppercase tracking-wide mb-2">☀️ Tarde</p>
          <ul className="space-y-1">
            <li>
              {a.lunch.done ? '✅' : '⬜'} Almoço
              <Stars stars={a.lunch.stars} />
            </li>
            <li>
              {a.water.ml ? '✅' : '⬜'} Água
              {a.water.ml && <span className="ml-1 text-sky-600 font-bold">{a.water.ml} mL</span>}
            </li>
            <li>
              {a.fruit.done ? '✅' : '⬜'} Fruta
              {a.fruit.fruits.length > 0 && <span className="ml-1 text-green-600">{a.fruit.fruits.join(', ')}</span>}
              <Stars stars={a.fruit.stars} />
            </li>
            <li className="font-medium text-gray-500 mt-1">Exercícios ({exDoneA}/3):</li>
            {EXERCISE_IDS.map((id) => (
              <li key={id} className="pl-2">
                {a.exercises[id].done ? '✅' : '⬜'} {EXERCISE_NAMES[id]}
                <Stars stars={a.exercises[id].stars} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default async function HistoricoPage() {
  const days = await listDays();
  const records = await Promise.all(days.map((d) => getDay(d)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">← Hoje</Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Histórico do Téo</h1>
            <p className="text-xs text-gray-400">{days.length} dia{days.length !== 1 ? 's' : ''} registrado{days.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {days.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 font-medium">Nenhum registro ainda.</p>
            <Link href="/" className="text-indigo-600 mt-4 inline-block hover:underline font-semibold">Ir para hoje →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => <DayCard key={record.date} record={record} />)}
          </div>
        )}
      </div>
    </div>
  );
}
