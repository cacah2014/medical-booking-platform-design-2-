"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronDown, CircleAlert, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { value: 6, label: "شنبه" },
  { value: 0, label: "یکشنبه" },
  { value: 1, label: "دوشنبه" },
  { value: 2, label: "سه‌شنبه" },
  { value: 3, label: "چهارشنبه" },
  { value: 4, label: "پنجشنبه" },
  { value: 5, label: "جمعه" },
];

export function NewDoctorForm({
  specialties,
  cities,
}: {
  specialties: { id: number; name: string }[];
  cities: { id: number; name: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [workingDays, setWorkingDays] = useState<number[]>([6, 0, 2]);
  const [onlineConsult, setOnlineConsult] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("male");

  function toggleDay(day: number) {
    setWorkingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const form = e.currentTarget;
    const data = new FormData(form);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          title: data.get("title"),
          medicalCode: data.get("medicalCode"),
          consultPrice: data.get("consultPrice"),
          onlinePrice: data.get("onlinePrice") || undefined,
          experienceYears: data.get("experienceYears"),
          gender,
          specialtyId: data.get("specialtyId"),
          cityId: data.get("cityId"),
          clinicAddress: data.get("clinicAddress"),
          clinicPhone: data.get("clinicPhone"),
          bio: data.get("bio"),
          education: data.get("education"),
          image: data.get("image"),
          slotDuration: data.get("slotDuration"),
          onlineConsult,
          workingDays,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "خطا در ثبت پزشک.");
        return;
      }
      setSuccessSlug(json.slug);
      form.reset();
      setWorkingDays([6, 0, 2]);
      setOnlineConsult(false);
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  const selectCls = "field appearance-none pe-9";

  if (successSlug) {
    return (
      <div className="rounded-3xl border border-jade-200 bg-cream p-10 text-center shadow-soft">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-jade-50">
          <CheckCircle2 className="size-9 text-jade-700" />
        </span>
        <h2 className="mt-5 text-xl font-black text-ink">پزشک جدید با موفقیت ثبت شد</h2>
        <p className="mt-2 text-sm text-ink-soft">پروفایل پزشک همین حالا در سایت فعال است.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href={`/doctors/${successSlug}`}
            target="_blank"
            className="rounded-xl bg-jade-700 px-6 py-3 text-sm font-extrabold text-cream transition-colors hover:bg-jade-800"
          >
            مشاهده پروفایل
          </Link>
          <Link
            href="/admin/doctors"
            className="rounded-xl border border-line px-6 py-3 text-sm font-extrabold text-ink-soft transition-colors hover:border-jade-400 hover:text-jade-700"
          >
            بازگشت به لیست
          </Link>
          <button
            onClick={() => setSuccessSlug(null)}
            className="rounded-xl bg-coral-500 px-6 py-3 text-sm font-extrabold text-cream transition-colors hover:bg-coral-600"
          >
            ثبت پزشک دیگر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Identity */}
      <fieldset className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
        <legend className="rounded-xl bg-jade-700 px-4 py-1.5 text-xs font-black text-cream">مشخصات پزشک</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">نام و نام خانوادگی *</label>
            <input name="fullName" required placeholder="مثلاً دکتر علی رضایی" className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">عنوان تخصصی *</label>
            <input name="title" required placeholder="مثلاً متخصص قلب و عروق" className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">کد نظام پزشکی (۵ رقم) *</label>
            <input name="medicalCode" required inputMode="numeric" placeholder="۱۲۳۴۵" className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">سابقه (سال) *</label>
            <input name="experienceYears" required type="number" min={1} max={60} defaultValue={10} className="field" />
          </div>
          <div className="relative">
            <label className="mb-1.5 block text-xs font-black text-ink">تخصص *</label>
            <select name="specialtyId" required className={selectCls}>
              <option value="">انتخاب کنید</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3.5 bottom-3 size-4 text-ink-faint" />
          </div>
          <div className="relative">
            <label className="mb-1.5 block text-xs font-black text-ink">شهر *</label>
            <select name="cityId" required className={selectCls}>
              <option value="">انتخاب کنید</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3.5 bottom-3 size-4 text-ink-faint" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-black text-ink">جنسیت</label>
          <div className="flex gap-2">
            {(
              [
                { value: "male", label: "آقا" },
                { value: "female", label: "خانم" },
              ] as const
            ).map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender(g.value)}
                className={cn(
                  "rounded-xl border px-5 py-2.5 text-xs font-extrabold transition-all",
                  gender === g.value ? "border-jade-600 bg-jade-700 text-cream" : "border-line bg-paper text-ink-soft"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-black text-ink">آدرس تصویر پروفایل (اختیاری)</label>
          <input name="image" placeholder="https://…" className="field" dir="ltr" style={{ textAlign: "left" }} />
          <p className="mt-1.5 text-[10px] text-ink-faint">در صورت خالی بودن، آواتار حروف نام نمایش داده می‌شود.</p>
        </div>
      </fieldset>

      {/* Clinic */}
      <fieldset className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
        <legend className="rounded-xl bg-jade-700 px-4 py-1.5 text-xs font-black text-cream">مطب و هزینه‌ها</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-black text-ink">آدرس مطب</label>
            <input name="clinicAddress" placeholder="مثلاً خیابان ولیعصر، کوچه…، پلاک…" className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">تلفن مطب</label>
            <input name="clinicPhone" placeholder="۰۲۱۲۲۳۳۴۴۵۵" className="field" dir="ltr" style={{ textAlign: "left" }} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">هزینه ویزیت حضوری (تومان) *</label>
            <input name="consultPrice" required type="number" min={50000} step={10000} placeholder="۴۵۰۰۰۰" className="field" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2.5 text-xs font-extrabold text-ink">
            <input
              type="checkbox"
              checked={onlineConsult}
              onChange={(e) => setOnlineConsult(e.target.checked)}
              className="size-4.5 rounded accent-jade-700"
            />
            مشاوره آنلاین دارد
          </label>
          {onlineConsult && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-ink-soft">هزینه مشاوره آنلاین (تومان):</label>
              <input name="onlinePrice" type="number" min={50000} step={10000} placeholder="۳۵۰۰۰۰" className="field w-40 !py-2" />
            </div>
          )}
        </div>
      </fieldset>

      {/* Schedule */}
      <fieldset className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
        <legend className="rounded-xl bg-jade-700 px-4 py-1.5 text-xs font-black text-cream">برنامه کاری</legend>
        <p className="mb-3 text-xs font-black text-ink">روزهای کاری در هفته *</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-xs font-extrabold transition-all",
                workingDays.includes(d.value) ? "border-jade-600 bg-jade-700 text-cream" : "border-line bg-paper text-ink-soft hover:border-jade-300"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <label className="mb-1.5 block text-xs font-black text-ink">مدت هر نوبت</label>
            <select name="slotDuration" className={selectCls} defaultValue="30">
              <option value="20">۲۰ دقیقه</option>
              <option value="30">۳۰ دقیقه</option>
              <option value="45">۴۵ دقیقه</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-3.5 bottom-3 size-4 text-ink-faint" />
          </div>
          <p className="self-end text-[11px] leading-5 text-ink-faint">
            ساعات کاری پیش‌فرض: صبح ۹ تا ۱۳ و عصر ۱۶ تا ۲۰ — بعداً از دیتابیس قابل تنظیم است.
          </p>
        </div>
      </fieldset>

      {/* Bio */}
      <fieldset className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
        <legend className="rounded-xl bg-jade-700 px-4 py-1.5 text-xs font-black text-cream">رزومه و معرفی</legend>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">مدرک تحصیلی</label>
            <input name="education" placeholder="مثلاً متخصص قلب و عروق — دانشگاه علوم پزشکی تهران" className="field" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-ink">درباره پزشک</label>
            <textarea name="bio" rows={4} placeholder="معرفی کوتاه پزشک برای نمایش در پروفایل…" className="field resize-none" />
          </div>
        </div>
      </fieldset>

      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3.5 text-sm font-bold text-coral-700">
          <CircleAlert className="size-5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-2xl bg-coral-500 px-8 py-4 text-sm font-black text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600 disabled:translate-y-0 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
          {loading ? "در حال ثبت…" : "ثبت پزشک جدید"}
        </button>
        <Link
          href="/admin/doctors"
          className="rounded-2xl border border-line bg-cream px-8 py-4 text-sm font-extrabold text-ink-soft transition-colors hover:border-jade-400 hover:text-jade-700"
        >
          انصراف
        </Link>
      </div>
    </form>
  );
}
