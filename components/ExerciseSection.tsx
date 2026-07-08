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
  const anyDone = doneCount > 0;
  const allDone = doneCount === EXERCISES.length;

  const borderColor = accent === 'amber' ? 'border-amber-100' : 'border-blue-100';

  return (
    <div className={`rounded-2xl border overflow-hidden bg-white ${borderColor}`}>
      {/* Cabeçalho */}
      <div className={`px-4 pt-4 pb-3 flex items-center gap-2 ${allDone ? 'bg-green-50' : ''}`}>
        <span className={`font-semibold text-base ${allDone ? 'text-green-700' : 'text-gray-700'}`}>
          🏋️ Exercícios
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          allDone
            ? 'bg-green-100 text-green-600'
            : anyDone
            ? 'bg-amber-100 text-amber-600'
            : 'bg-gray-100 text-gray-400'
        }`}>
          {doneCount}/{EXERCISES.length}
        </span>
      </div>

      {/* Lista de exercícios */}
      <div className="divide-y divide-gray-50">
        {EXERCISES.map((ex) => {
          const state = exercises[ex.id];
          const isOpen = openVideo === ex.id;

          return (
            <div key={ex.id} className={`transition-all ${state.done ? 'bg-green-50' : 'bg-white'}`}>
              {/* Linha principal */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => onToggle(ex.id)}
                  className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    state.done
                      ? 'bg-green-500 border-green-500 text-white shadow-sm'
                      : 'border-gray-300 hover:border-green-400 bg-white'
                  }`}
                  aria-label={state.done ? 'Desmarcar' : 'Marcar como feito'}
                >
                  {state.done && <span className="text-sm font-bold">✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${state.done ? 'text-green-700' : 'text-gray-700'}`}>
                      {ex.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      state.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
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
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    isOpen
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  }`}
                >
                  {isOpen ? '✕' : '▶ Ver'}
                </button>
              </div>

              {/* Estrelas individuais (aparecem quando o exercício é marcado) */}
              {state.done && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-gray-400 mb-1">Como o Téo foi?</p>
                  <StarRating stars={state.stars} onChange={(stars) => onRate(ex.id, stars)} />
                </div>
              )}

              {/* Player de vídeo */}
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="rounded-2xl overflow-hidden bg-black shadow-md aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ex.videoId}?start=${ex.startSeconds}&end=${ex.endSeconds}&autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={ex.name}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
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
