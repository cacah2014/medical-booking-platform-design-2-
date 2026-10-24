import { db } from "@/db";
import { siteSettings } from "@/db/schema";

/** مقادیر پیش‌فرض — اگر مدیر چیزی را تغییر نداده باشد، این‌ها نمایش داده می‌شود */
export const DEFAULT_SETTINGS = {
  announcement: "رزرو نوبت در سراسر کشور — سریع، مطمئن و بدون کارمزد",
  phone: "۰۲۱-۹۱۳۰ ۴۵ ۶۷",
  phoneLink: "02191304567",
  email: "support@nobatesalamat.ir",
  address: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۲۴۰",
  statsDoctors: "۱۲,۴۰۰",
  statsAppointments: "۲,۸۰۰,۰۰۰",
  statsSatisfaction: "۹۸",
  statsSpecialties: "۲۷",
} as const;

export type SiteSettings = typeof DEFAULT_SETTINGS;
export type SettingKey = keyof SiteSettings;

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as SettingKey[];

let cache: { value: SiteSettings; at: number } | null = null;

/** تنظیمات سایت = پیش‌فرض‌ها + مقادیر ویرایش‌شده توسط مدیر در دیتابیس */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < 15_000) return cache.value;
  try {
    const rows = await db.select().from(siteSettings);
    const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const merged = { ...DEFAULT_SETTINGS, ...overrides } as SiteSettings;
    cache = { value: merged, at: Date.now() };
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function invalidateSettingsCache() {
  cache = null;
}
