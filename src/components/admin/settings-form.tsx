"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert, CircleCheck, Loader2, Megaphone, Save, TrendingUp, Users2, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/site-settings";

const FIELD =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-all focus:border-jade-400 focus:ring-4 focus:ring-jade-400/15";

interface FieldDef {
  key: keyof SiteSettings;
  label: string;
  hint?: string;
  dir?: "ltr";
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Megaphone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
      <legend className="flex items-center gap-2 rounded-xl bg-jade-700 px-4 py-1.5 text-xs font-black text-cream">
        <Icon className="size-4" />
        {title}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set(key: keyof SiteSettings, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره تنظیمات.");
      setMsg({ type: "ok", text: "تنظیمات ذخیره شد و همین حالا روی سایت اعمال شده است." });
      router.refresh();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const contactFields: FieldDef[] = [
    { key: "phone", label: "شماره تماس (نمایشی)", hint: "مثلاً ۰۲۱-۹۱۳۰ ۴۵ ۶۷" },
    { key: "phoneLink", label: "شماره تماس (لینک tel:)", hint: "فقط اعداد، بدون خط‌تیره", dir: "ltr" },
    { key: "email", label: "ایمیل پشتیبانی", dir: "ltr" },
    { key: "address", label: "آدرس دفتر", hint: "در فوتر سایت نمایش داده می‌شود" },
  ];

  const statFields: FieldDef[] = [
    { key: "statsDoctors", label: "تعداد پزشکان", hint: "مثلاً ۱۲,۴۰۰ — به‌صورت متنی در سایت نمایش داده می‌شود" },
    { key: "statsAppointments", label: "نوبت‌های موفق", hint: "مثلاً ۲,۸۰۰,۰۰۰" },
    { key: "statsSpecialties", label: "تعداد تخصص‌ها", hint: "مثلاً ۲۷" },
    { key: "statsSatisfaction", label: "درصد رضایت", hint: "مثلاً ۹۸" },
  ];

  return (
    <div className="space-y-6">
      {/* Announcement */}
      <fieldset className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
        <legend className="flex items-center gap-2 rounded-xl bg-jade-700 px-4 py-1.5 text-xs font-black text-cream">
          <Megaphone className="size-4" />
          نوار اطلاعیه بالای سایت
        </legend>
        <label className="mb-1.5 block text-xs font-black text-ink">متن اطلاعیه</label>
        <input
          value={values.announcement}
          onChange={(e) => set("announcement", e.target.value)}
          className={FIELD}
          placeholder="رزرو نوبت در سراسر کشور — سریع، مطمئن و بدون کارمزد"
        />
      </fieldset>

      <Section icon={Wrench} title="اطلاعات تماس">
        {contactFields.map((f) => (
          <div key={f.key} className={f.key === "address" ? "sm:col-span-2" : ""}>
            <label className="mb-1.5 block text-xs font-black text-ink">{f.label}</label>
            <input
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.hint}
              className={FIELD}
              dir={f.dir}
              style={f.dir ? { textAlign: "left" } : undefined}
            />
            {f.hint && <p className="mt-1 text-[10px] text-ink-faint">{f.hint}</p>}
          </div>
        ))}
      </Section>

      <Section icon={TrendingUp} title="آمار نمایشی سایت">
        {statFields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-xs font-black text-ink">{f.label}</label>
            <input
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.hint}
              className={FIELD}
            />
            {f.hint && <p className="mt-1 text-[10px] text-ink-faint">{f.hint}</p>}
          </div>
        ))}
        <p className="sm:col-span-2 flex items-center gap-2 rounded-xl bg-jade-50 px-4 py-3 text-[11px] font-bold leading-5 text-jade-800">
          <Users2 className="size-4.5 shrink-0" />
          این اعداد در صفحه اصلی (بخش آمار، شریط اعتماد و کارت‌های شناور) استفاده می‌شوند و می‌توانید آن‌ها را با رشد واقعی پلتفرم به‌روزرسانی کنید.
        </p>
      </Section>

      {msg && (
        <p
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-4 text-sm font-bold",
            msg.type === "ok" ? "bg-jade-50 text-jade-700" : "bg-coral-50 text-coral-700"
          )}
        >
          {msg.type === "ok" ? <CircleCheck className="size-5" /> : <CircleAlert className="size-5" />}
          {msg.text}
        </p>
      )}

      <button
        onClick={save}
        disabled={busy}
        className="flex items-center gap-2 rounded-2xl bg-coral-500 px-8 py-4 text-sm font-black text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600 disabled:translate-y-0 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
        {busy ? "در حال ذخیره…" : "ذخیره و انتشار تغییرات"}
      </button>
    </div>
  );
}
