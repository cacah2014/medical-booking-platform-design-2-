import { addDaysISO, isoOf, todayIranISO, weekdayOf } from "@/lib/utils";

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Expand shift windows like [["09:00","13:00"]] into discrete slot start times */
export function generateSlots(shifts: string[][], duration: number): string[] {
  const out: string[] = [];
  for (const [start, end] of shifts) {
    let cur = toMinutes(start);
    const endMin = toMinutes(end);
    while (cur + duration <= endMin) {
      out.push(toHHMM(cur));
      cur += duration;
    }
  }
  return out;
}

/**
 * Return up to `count` upcoming working dates (ISO) for a doctor,
 * starting `offsetDays` days from today (Iran time).
 */
export function upcomingDates(workingDays: number[], count = 7, offsetDays = 0): string[] {
  const today = todayIranISO();
  const res: string[] = [];
  let guard = 0;
  let cursor = offsetDays;
  while (res.length < count && guard < 60) {
    const iso = addDaysISO(today, cursor);
    if (workingDays.includes(weekdayOf(iso))) res.push(iso);
    cursor += 1;
    guard += 1;
  }
  if (res.length === 0) {
    // Fallback: plain consecutive days
    for (let i = offsetDays; res.length < count; i++) res.push(addDaysISO(today, i));
  }
  return res;
}

/** First bookable date for a doctor (used for "first available" chips) */
export function firstAvailableDate(workingDays: number[], offsetDays: number): string {
  return upcomingDates(workingDays, 1, offsetDays)[0];
}

export interface DoctorDayCard {
  iso: string;
  weekdayTiny: string;
  day: string;
  month: string;
}
