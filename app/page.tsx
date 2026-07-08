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

// ── Checkbox simples (remédios e almoço) ──────────────────────────────────────

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
    <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
      item.done
        ? 'bg-green-50 border-green-200'
        : accent === 'amber'
        ? 'bg-white border-amber-100 hover:border-amber-300'
        : 'bg-white border-blue-100 hover:border-blue-300'
    }`}>
      <button
        onClick={onToggle}
        className={`mt-0.5 w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
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
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

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

  // ── Remédios ──────────────────────────────────────────────────────────────

  const toggleMedicine = (med: 'kollis' | 'ferro' | 'vitaminaD') =>
    update((r) => {
      const item = r.morning.medicines[med];
      item.done = !item.done;
      item.time = item.done ? getBrasiliaTime() : null;
      return r;
    });

  // ── Água Manhã ────────────────────────────────────────────────────────────

  const updateMorningWater = (ml: number | null) =>
    update((r) => {
      const wasEmpty = !r.morning.water.ml;
      r.morning.water.ml = ml;
      if (ml && wasEmpty) r.morning.water.time = getBrasiliaTime();
      if (!ml) r.morning.water.time = null;
      return r;
    });

  // ── Fruta Manhã ───────────────────────────────────────────────────────────

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

  // ── Exercícios Manhã ──────────────────────────────────────────────────────

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

  // ── Almoço ────────────────────────────────────────────────────────────────

  const toggleLunch = () =>
    update((r) => {
      r.afternoon.lunch.done = !r.afternoon.lunch.done;
      r.afternoon.lunch.time = r.afternoon.lunch.done ? getBrasiliaTime() : null;
      if (!r.afternoon.lunch.done) r.afternoon.lunch.stars = 0;
      return r;
    });

  const rateLunch = (stars: number) =>
    update((r) => { r.afternoon.lunch.stars = stars; return r; });

  // ── Água Tarde ────────────────────────────────────────────────────────────

  const updateAfternoonWater = (ml: number | null) =>
    update((r) => {
      const wasEmpty = !r.afternoon.water.ml;
      r.afternoon.water.ml = ml;
      if (ml && wasEmpty) r.afternoon.water.time = getBrasiliaTime();
      if (!ml) r.afternoon.water.time = null;
      return r;
    });

  // ── Fruta Tarde ───────────────────────────────────────────────────────────

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

  // ── Exercícios Tarde ──────────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-pulse">👶</div>
          <p className="text-gray-500 font-medium">Carregando rotina do Téo...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-500 font-medium">Erro ao carregar os dados.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { morning, afternoon } = record;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">👶</div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Rotina do Téo</h1>
          <p className="text-gray-500 mt-1 capitalize text-sm">{formatDateLong(today)}</p>
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-400">
            <Link href="/historico" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm underline underline-offset-2">
              📋 Ver histórico
            </Link>
            <span>·</span>
            {saving
              ? <span className="animate-pulse">Salvando...</span>
              : lastSaved
              ? <span>Salvo às {lastSaved}</span>
              : <span>Nenhuma alteração ainda</span>
            }
          </div>
        </div>

        {/* ══ MANHÃ ══════════════════════════════════════════════════════════ */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌅</span>
            <h2 className="text-xl font-bold text-amber-700">Manhã</h2>
          </div>

          <div className="space-y-3">
            {/* Remédios */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">💊 Remédios</p>
              <div className="space-y-2">
                <CheckRow label="Kollis" item={morning.medicines.kollis} onToggle={() => toggleMedicine('kollis')} accent="amber" />
                <CheckRow label="Ferro" item={morning.medicines.ferro} onToggle={() => toggleMedicine('ferro')} accent="amber" />
                <CheckRow label="Vitamina D" item={morning.medicines.vitaminaD} onToggle={() => toggleMedicine('vitaminaD')} accent="amber" />
              </div>
            </div>

            {/* Água */}
            <WaterInput item={morning.water} onUpdate={updateMorningWater} accent="amber" />

            {/* Fruta */}
            <FruitPicker
              label="🍌 Fruta"
              item={morning.fruit}
              onToggle={toggleMorningFruit}
              onFruitToggle={toggleMorningFruitItem}
              onRate={rateMorningFruit}
              accent="amber"
            />

            {/* Exercícios */}
            <ExerciseSection
              exercises={morning.exercises}
              onToggle={toggleMorningExercise}
              onRate={rateMorningExercise}
              accent="amber"
            />
          </div>
        </section>

        {/* ══ TARDE ══════════════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">☀️</span>
            <h2 className="text-xl font-bold text-blue-700">Tarde</h2>
          </div>

          <div className="space-y-3">
            {/* Almoço */}
            <CheckRow label="🍽️ Almoço" item={afternoon.lunch} onToggle={toggleLunch} accent="blue">
              {afternoon.lunch.done && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 font-medium">Como o Téo comeu?</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => rateLunch(s === afternoon.lunch.stars ? 0 : s)}
                        className={`text-3xl transition-all hover:scale-110 active:scale-95 leading-none ${
                          s <= afternoon.lunch.stars ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                      >★</button>
                    ))}
                  </div>
                </div>
              )}
            </CheckRow>

            {/* Água */}
            <WaterInput item={afternoon.water} onUpdate={updateAfternoonWater} accent="blue" />

            {/* Fruta */}
            <FruitPicker
              label="🍎 Fruta"
              item={afternoon.fruit}
              onToggle={toggleAfternoonFruit}
              onFruitToggle={toggleAfternoonFruitItem}
              onRate={rateAfternoonFruit}
              accent="blue"
            />

            {/* Exercícios */}
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
