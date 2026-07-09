'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { DayRecord, CheckItem, ExerciseId } from '@/lib/types';
import ExerciseSection from '@/components/ExerciseSection';
import FruitPicker from '@/components/FruitPicker';
import WaterInput from '@/components/WaterInput';

function getBrasiliaDate(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

function getBrasiliaTime(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function CheckRow({
  label,
  item,
  onToggle,
  children,
  accent = 'amber',
}: {
  label: string;
  item: CheckItem;
  onToggle: () => void;
  children?: React.ReactNode;
  accent?: 'amber' | 'blue';
}) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl transition-all ${
      item.done
        ? 'bg-emerald-50 border border-emerald-100'
        : accent === 'amber'
        ? 'bg-white border border-amber-100 hover:border-amber-300 shadow-sm'
        : 'bg-white border border-violet-100 hover:border-violet-300 shadow-sm'
    }`}>
      <button
        onClick={onToggle}
        className={`mt-0.5 w-10 h-10 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          item.done
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100'
            : accent === 'amber'
            ? 'border-amber-200 bg-amber-50 hover:border-amber-400'
            : 'border-violet-200 bg-violet-50 hover:border-violet-400'
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
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

export default function Home() {
  const today = getBrasiliaDate();
  const [record, setRecord] = useState<DayRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/daily/${today}`)
      .then((r) => r.json())
      .then((data: DayRecord) => {
        setRecord(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [today]);

  const save = useCallback(
    async (newRecord: DayRecord) => {
      setSaving(true);
      try {
        await fetch(`/api/daily/${today}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        });
        setLastSaved(getBrasiliaTime());
      } finally {
        setSaving(false);
      }
    },
    [today]
  );

  const update = useCallback(
    (updater: (r: DayRecord) => DayRecord) => {
      setRecord((prev) => {
        if (!prev) return prev;
        const next = updater(JSON.parse(JSON.stringify(prev)) as DayRecord);
        save(next);
        return next;
      });
    },
    [save]
  );

  const toggleMedicine = (med: 'kollis' | 'ferro' | 'vitaminaD') =>
    update((r) => {
      const item = r.morning.medicines[med];
      item.done = !item.done;
      item.time = item.done ? getBrasiliaTime() : null;
      return r;
    });

  const updateMorningWater = (ml: number | null) =>
    update((r) => {
      const wasEmpty = !r.morning.water.ml;
      r.morning.water.ml = ml;
      if (ml && wasEmpty) r.morning.water.time = getBrasiliaTime();
      if (!ml) r.morning.water.time = null;
      return r;
    });

  const toggleMorningFruit = () =>
    update((r) => {
      r.morning.fruit.done = !r.morning.fruit.done;
      r.morning.fruit.time = r.morning.fruit.done ? getBrasiliaTime() : null;
      if (!r.morning.fruit.done) {
        r.morning.fruit.fruits = [];
        r.morning.fruit.stars = 0;
      }
      return r;
    });

  const toggleMorningFruitItem = (fruit: string) =>
    update((r) => {
      const idx = r.morning.fruit.fruits.indexOf(fruit);
      if (idx === -1) r.morning.fruit.fruits.push(fruit);
      else r.morning.fruit.fruits.splice(idx, 1);
      return r;
    });

  const rateMorningFruit = (stars: number) =>
    update((r) => { r.morning.fruit.stars = stars; return r; });

  const toggleMorningExercise = (id: ExerciseId) =>
    update((r) => {
      const ex = r.morning.exercises[id];
      ex.done = !ex.done;
      ex.time = ex.done ? getBrasiliaTime() : null;
      if (!ex.done) ex.stars = 0;
      return r;
    });

  const rateMorningExercise = (id: ExerciseId, stars: number) =>
    update((r) => { r.morning.exercises[id].stars = stars; return r; });

  const toggleLunch = () =>
    update((r) => {
      r.afternoon.lunch.done = !r.afternoon.lunch.done;
      r.afternoon.lunch.time = r.afternoon.lunch.done ? getBrasiliaTime() : null;
      if (!r.afternoon.lunch.done) r.afternoon.lunch.stars = 0;
      return r;
    });

  const rateLunch = (stars: number) =>
    update((r) => { r.afternoon.lunch.stars = stars; return r; });

  const updateAfternoonWater = (ml: number | null) =>
    update((r) => {
      const wasEmpty = !r.afternoon.water.ml;
      r.afternoon.water.ml = ml;
      if (ml && wasEmpty) r.afternoon.water.time = getBrasiliaTime();
      if (!ml) r.afternoon.water.time = null;
      return r;
    });

  const toggleAfternoonFruit = () =>
    update((r) => {
      r.afternoon.fruit.done = !r.afternoon.fruit.done;
      r.afternoon.fruit.time = r.afternoon.fruit.done ? getBrasiliaTime() : null;
      if (!r.afternoon.fruit.done) {
        r.afternoon.fruit.fruits = [];
        r.afternoon.fruit.stars = 0;
      }
      return r;
    });

  const toggleAfternoonFruitItem = (fruit: string) =>
    update((r) => {
      const idx = r.afternoon.fruit.fruits.indexOf(fruit);
      if (idx === -1) r.afternoon.fruit.fruits.push(fruit);
      else r.afternoon.fruit.fruits.splice(idx, 1);
      return r;
    });

  const rateAfternoonFruit = (stars: number) =>
    update((r) => { r.afternoon.fruit.stars = stars; return r; });

  const toggleAfternoonExercise = (id: ExerciseId) =>
    update((r) => {
      const ex = r.afternoon.exercises[id];
      ex.done = !ex.done;
      ex.time = ex.done ? getBrasiliaTime() : null;
      if (!ex.done) ex.stars = 0;
      return r;
    });

  const rateAfternoonExercise = (id: ExerciseId, stars: number) =>
    update((r) => { r.afternoon.exercises[id].stars = stars; return r; });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">👶</div>
          <p className="text-gray-400 font-semibold">Carregando rotina do Téo...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-500 font-semibold">Erro ao carregar os dados.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { morning, afternoon } = record;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50/20 to-sky-50">
      <div className="max-w-xl mx-auto px-4 py-6 pb-10">

        <div className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 shadow-xl shadow-orange-100">
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-3">
              <img
                src="/teo.jpeg"
                alt="Téo"
                className="w-20 h-20 rounded-full object-cover border-4 border-white/50 shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Rotina do Téo</h1>
            <p className="text-orange-100 text-sm capitalize mt-1">{formatDateLong(today)}</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link
                href="/historico"
                className="text-white text-xs font-bold bg-white/25 px-4 py-2 rounded-full hover:bg-white/35 transition-all"
              >
                📋 Histórico
              </Link>
              <span className={`text-xs px-4 py-2 rounded-full font-semibold ${
                saving
                  ? 'bg-white/20 text-white/80 animate-pulse'
                  : lastSaved
                  ? 'bg-white/25 text-white'
                  : 'bg-white/15 text-white/60'
              }`}>
                {saving ? '⏳ Salvando...' : lastSaved ? `✓ ${lastSaved}` : 'Sem alterações'}
              </span>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-4 left-8 w-3 h-3 bg-white/30 rounded-full pointer-events-none" />
          <div className="absolute bottom-6 right-10 w-2 h-2 bg-white/30 rounded-full pointer-events-none" />
        </div>

        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">🌅</div>
            <div>
              <h2 className="text-lg font-black text-gray-800">Manhã</h2>
              <p className="text-xs text-gray-400">Remédios, água, fruta e exercícios</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-3xl shadow-sm border border-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💊</span>
                <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Remédios</p>
              </div>
              <div className="space-y-2">
                <CheckRow label="Kollis" item={morning.medicines.kollis} onToggle={() => toggleMedicine('kollis')} accent="amber" />
                <CheckRow label="Ferro" item={morning.medicines.ferro} onToggle={() => toggleMedicine('ferro')} accent="amber" />
                <CheckRow label="Vitamina D" item={morning.medicines.vitaminaD} onToggle={() => toggleMedicine('vitaminaD')} accent="amber" />
              </div>
            </div>

            <WaterInput item={morning.water} onUpdate={updateMorningWater} accent="amber" />

            <FruitPicker
              label="🍌 Fruta"
              item={morning.fruit}
              onToggle={toggleMorningFruit}
              onFruitToggle={toggleMorningFruitItem}
              onRate={rateMorningFruit}
              accent="amber"
            />

            <ExerciseSection
              exercises={morning.exercises}
              onToggle={toggleMorningExercise}
              onRate={rateMorningExercise}
              accent="amber"
            />
          </div>
        </section>

        <div className="flex items-center gap-3 my-6 px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
          <span className="text-gray-300 text-sm">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-200 to-gray-200" />
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">☀️</div>
            <div>
              <h2 className="text-lg font-black text-gray-800">Tarde</h2>
              <p className="text-xs text-gray-400">Almoço, água, fruta e exercícios</p>
            </div>
          </div>

          <div className="space-y-3">
            <CheckRow label="🍽️ Almoço" item={afternoon.lunch} onToggle={toggleLunch} accent="blue">
              {afternoon.lunch.done && (
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Como o Téo comeu?</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => rateLunch(s === afternoon.lunch.stars ? 0 : s)}
                        className={`text-3xl transition-all hover:scale-110 active:scale-95 leading-none ${
                          s <= afternoon.lunch.stars ? 'text-amber-400' : 'text-gray-200'
                        }`}
                      >★</button>
                    ))}
                  </div>
                </div>
              )}
            </CheckRow>

            <WaterInput item={afternoon.water} onUpdate={updateAfternoonWater} accent="blue" />

            <FruitPicker
              label="🍎 Fruta"
              item={afternoon.fruit}
              onToggle={toggleAfternoonFruit}
              onFruitToggle={toggleAfternoonFruitItem}
              onRate={rateAfternoonFruit}
              accent="blue"
            />

            <ExerciseSection
              exercises={afternoon.exercises}
              onToggle={toggleAfternoonExercise}
              onRate={rateAfternoonExercise}
              accent="blue"
            />
          </div>
        </section>

        <p className="text-center text-xs text-gray-300">Rotina do Téo · {today}</p>
      </div>
    </div>
  );
}
