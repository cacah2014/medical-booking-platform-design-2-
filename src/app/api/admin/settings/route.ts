import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings, invalidateSettingsCache, SETTING_KEYS, type SettingKey } from "@/lib/site-settings";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });
  return NextResponse.json({ settings: await getSiteSettings() });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const allowed = new Set<string>(SETTING_KEYS);
  const entries: [SettingKey, string][] = [];
  for (const [key, raw] of Object.entries(body)) {
    if (!allowed.has(key)) continue;
    const value = String(raw ?? "").trim();
    if (!value) return NextResponse.json({ error: `«${key}» نمی‌تواند خالی باشد.` }, { status: 400 });
    if (value.length > 500) return NextResponse.json({ error: "متن بیش از حد طولانی است (حداکثر ۵۰۰ کاراکتر)." }, { status: 400 });
    entries.push([key as SettingKey, value]);
  }

  if (entries.length === 0) {
    return NextResponse.json({ error: "فیلد معتبری ارسال نشده است." }, { status: 400 });
  }

  for (const [key, value] of entries) {
    await db
      .insert(siteSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  }

  invalidateSettingsCache();
  return NextResponse.json({ ok: true, settings: await getSiteSettings() });
}
