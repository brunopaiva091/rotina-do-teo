import type { DayRecord } from './types';

function createEmptyDay(date: string): DayRecord {
  const emptyExercises = {
    ex1: { done: false, time: null, stars: 0 },
    ex2: { done: false, time: null, stars: 0 },
    ex3: { done: false, time: null, stars: 0 },
  };
  const emptyFruit = { done: false, time: null, fruits: [], stars: 0 };

  return {
    date,
    lastUpdated: new Date().toISOString(),
    morning: {
      medicines: {
        kollis: { done: false, time: null },
        ferro: { done: false, time: null },
        vitaminaD: { done: false, time: null },
      },
      water: { ml: null, time: null },
      fruit: { ...emptyFruit },
      exercises: { ...emptyExercises },
    },
    afternoon: {
      lunch: { done: false, time: null, stars: 0 },
      water: { ml: null, time: null },
      fruit: { ...emptyFruit },
      exercises: { ...emptyExercises },
    },
  };
}

// Fallback em memória para desenvolvimento local (sem Supabase configurado)
const memStore = new Map<string, DayRecord>();

function isSupabaseConfigured() {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;
}

async function getClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
}

export async function getDay(date: string): Promise<DayRecord> {
  if (isSupabaseConfigured()) {
    const supabase = await getClient();
    const { data } = await supabase
      .from('daily_records')
      .select('data')
      .eq('date', date)
      .single();
    return (data?.data as DayRecord) ?? createEmptyDay(date);
  }
  return memStore.get(date) ?? createEmptyDay(date);
}

export async function saveDay(date: string, record: DayRecord): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await getClient();
    await supabase
      .from('daily_records')
      .upsert({ date, data: record, updated_at: new Date().toISOString() });
    return;
  }
  memStore.set(date, record);
}

export async function listDays(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getClient();
    const { data } = await supabase
      .from('daily_records')
      .select('date')
      .order('date', { ascending: false });
    return (data ?? []).map((row: { date: string }) => row.date);
  }
  return Array.from(memStore.keys()).sort().reverse();
}
