'use client';

import { useState } from 'react';
import StarRating from './StarRating';
import type { ExerciseId, ExercisesRecord } from '@/lib/types';

interface ExerciseDef {
  id: ExerciseId;
  name: string;
  instructions: string;
  videoId: string;
  startSeconds: number;
  endSeconds: number;
}

const EXERCISES: ExerciseDef[] = [
  {
    id: 'ex1',
    name: 'Fortalecendo a perninha',
    instructions: '2x15',
    videoId: 'RduiGgsJTuY',
    startSeconds: 3,
    endSeconds: 23,
  },
  {
    id: 'ex2',
    name: 'Engatinhando',
    instructions: 'Ir e voltar no tapete',
    videoId: 'RduiGgsJTuY',
    startSeconds: 44,
    endSeconds: 86,
  },
  {
    id: 'ex3',
    name: 'Fortalecendo a perninha',
    instructions: '5 min',
    videoId: 'bgsIMroqTgs',
    startSeconds: 340,
    endSeconds: 360,
  },
];

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface Props {
  exercises: ExercisesRecord;
  onToggle: (id: ExerciseId) => void;
  onRate: (id: ExerciseId, stars: number) => void;
  accent?: 'amber' | 'blue';
}

export default function ExerciseSection({ exercises, onToggle, onRate, accent = 'amber' }: Props) {
  const [openVideo, setOpenVideo] = useState<ExerciseId | null>(null);

  const doneCount = EXERCISES.filter((ex) => exercises[ex.id].done).length;
  const allDone = doneCount === EXERCISES.length;

  const badgeColor = allDone
    ? 'bg-emerald-100 text-emerald-600'
    : doneCount > 0
    ? 'bg-amber-100 text-amber-600'
    : 'bg-gray-100 text-gray-400';

  const accentBorder = accent === 'amber' ? 'border-amber-100' : 'border-violet-100';
  const checkIdle = accent === 'amber'
    ? 'bg-amber-50 border-2 border-amber-200 hover:border-amber-400'
    : 'bg-violet-50 border-2 border-violet-200 hover:border-violet-400';

  return (
    <div className={`rounded-3xl border overflow-hidden bg-white shadow-sm ${accentBorder}`}>
      <div className={`px-4 pt-4 pb-3 flex items-center justify-between ${allDone ? 'bg-emerald-50' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-base">🏋️</div>
          <span className={`font-black text-base ${allDone ? 'text-emerald-700' : 'text-gray-800'}`}>
            Exercícios
          </span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${badgeColor}`}>
          {doneCount}/{EXERCISES.length}
        </span>
      </div>

      <div className="divide-y divide-gray-50 px-3 pb-3">
        {EXERCISES.map((ex) => {
          const state = exercises[ex.id];
          const isOpen = openVideo === ex.id;

          return (
            <div key={ex.id} className="py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle(ex.id)}
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                    state.done
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100'
                      : checkIdle
                  }`}
                  aria-label={state.done ? 'Desmarcar' : 'Marcar como feito'}
                >
                  {state.done && <span className="text-sm font-bold">✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-sm block ${state.done ? 'text-emerald-700' : 'text-gray-800'}`}>
                    {ex.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      state.done ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ex.instructions}
                    </span>
                    {state.time && (
                      <span className="text-xs text-gray-400">🕐 {state.time}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setOpenVideo(isOpen ? null : ex.id)}
                  className={`flex-shrink-0 text-xs px-3 py-2 rounded-xl font-bold transition-all ${
                    isOpen
                      ? 'bg-red-100 text-red-500 hover:bg-red-200'
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  }`}
                >
                  {isOpen ? '✕' : '▶ Ver'}
                </button>
              </div>

              {state.done && (
                <div className="mt-2.5 pl-12">
                  <p className="text-xs text-gray-400 mb-1.5 font-medium">Como o Téo foi?</p>
                  <StarRating stars={state.stars} onChange={(stars) => onRate(ex.id, stars)} />
                </div>
              )}

              {isOpen && (
                <div className="mt-3">
                  <div className="rounded-2xl overflow-hidden bg-black shadow-lg aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ex.videoId}?start=${ex.startSeconds}&end=${ex.endSeconds}&autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={ex.name}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">
                    Trecho: {formatSeconds(ex.startSeconds)} – {formatSeconds(ex.endSeconds)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
