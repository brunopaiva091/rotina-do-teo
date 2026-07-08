import { NextRequest, NextResponse } from 'next/server';
import { getDay, saveDay } from '@/lib/storage';
import type { DayRecord } from '@/lib/types';

type Params = { params: Promise<{ date: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { date } = await params;
  const record = await getDay(date);
  return NextResponse.json(record);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { date } = await params;
  const body = (await req.json()) as DayRecord;
  const updated: DayRecord = { ...body, date, lastUpdated: new Date().toISOString() };
  await saveDay(date, updated);
  return NextResponse.json(updated);
}
