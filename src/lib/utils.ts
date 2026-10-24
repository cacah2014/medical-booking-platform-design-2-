export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert Latin digits to Persian digits for display */
export function toFa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Normalize Persian/Arabic digits back to Latin (for inputs / validation) */
export function toEnDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

export function formatToman(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  const formatted = new Intl.NumberFormat("fa-IR").format(amount);
  return `${formatted} تومان`;
}

export function formatFaNumber(n: number | string): string {
  return new Intl.NumberFormat("fa-IR").format(Number(n));
}

export function formatFaDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }
): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("fa-IR", opts).format(d);
}

export function formatFaDateTime(iso: string, time: string): string {
  return `${formatFaDate(iso)} — ساعت ${toFa(time)}`;
}

/** Today's date in Asia/Tehran as ISO `YYYY-MM-DD` */
export function todayIranISO(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Current time in Asia/Tehran in minutes since midnight */
export function nowIranMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return (h % 24) * 60 + m;
}

/** ISO string of a Date (using its local noon to avoid TZ drift) */
export function isoOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysISO(baseISO: string, days: number): string {
  const d = new Date(`${baseISO}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoOf(d);
}

/** JS weekday index for ISO date (0=Sunday … 6=Saturday) */
export function weekdayOf(iso: string): number {
  return new Date(`${iso}T12:00:00`).getDay();
}

export const FA_WEEKDAY_SHORT: Record<number, string> = {
  0: "یکشنبه",
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
};

export const FA_WEEKDAY_TINY: Record<number, string> = {
  0: "یک",
  1: "دو",
  2: "سه",
  3: "چهار",
  4: "پنج",
  5: "جمعه",
  6: "شنبه",
};

export function faDayOfMonth(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(new Date(`${iso}T12:00:00`));
}

export function faMonthName(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(new Date(`${iso}T12:00:00`));
}

/** Relative "first available" label for an ISO date */
export function relativeDayLabel(iso: string): string {
  const today = todayIranISO();
  if (iso === today) return "امروز";
  if (iso === addDaysISO(today, 1)) return "فردا";
  return formatFaDate(iso, { weekday: "long" });
}

export function generateTrackingCode(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `NS-${code}`;
}
