import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  Clock3,
  CreditCard,
  MessageSquareText,
  Star,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { getDashboardStats } from "@/lib/admin-queries";
import {
  FA_WEEKDAY_TINY,
  faDayOfMonth,
  formatFaDate,
  formatFaNumber,
  formatToman,
  toFa,
  todayIranISO,
  weekdayOf,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "داشبورد مدیریت",
  robots: { index: false, follow: false },
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "تایید شده", cls: "bg-jade-50 text-jade-700" },
  completed: { label: "انجام شده", cls: "bg-sun-100 text-sun-600" },
  cancelled: { label: "لغو شده", cls: "bg-coral-50 text-coral-600" },
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const maxWeekly = Math.max(1, ...stats.weekly.map((w) => w.count));
  const todayISO = todayIranISO();

  const kpis = [
    { icon: Stethoscope, label: "پزشکان فعال", value: formatFaNumber(stats.doctorsActive), sub: `از مجموع ${formatFaNumber(stats.doctorsTotal)} پزشک`, tint: "bg-jade-50 text-jade-700" },
    { icon: CalendarDays, label: "نوبت‌های امروز", value: formatFaNumber(stats.appointmentsToday), sub: `${formatFaNumber(stats.appointmentsTotal)} نوبت در مجموع`, tint: "bg-sun-100 text-sun-600" },
    { icon: Clock3, label: "در انتظار انجام", value: formatFaNumber(stats.appointmentsPending), sub: "نوبت‌های تاییدشده آینده", tint: "bg-coral-50 text-coral-600" },
    { icon: CreditCard, label: "گردش مالی ویزیت‌ها", value: formatToman(stats.revenueTotal), sub: "نوبت‌های فعال و انجام‌شده", tint: "bg-jade-50 text-jade-700" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">داشبورد مدیریت</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {formatFaDate(todayISO, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/admin/doctors/new"
          className="flex items-center gap-2 rounded-xl bg-coral-500 px-5 py-3 text-sm font-extrabold text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600"
        >
          <Stethoscope className="size-4.5" />
          افزودن پزشک جدید
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-3xl border border-line bg-cream p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className={`grid size-11 place-items-center rounded-2xl ${kpi.tint}`}>
                <kpi.icon className="size-5.5" strokeWidth={1.9} />
              </span>
              <TrendingUp className="size-4 text-jade-400" />
            </div>
            <p className="mt-4 text-xl font-black text-ink">{kpi.value}</p>
            <p className="mt-1 text-xs font-bold text-ink-soft">{kpi.label}</p>
            <p className="mt-0.5 text-[11px] text-ink-faint">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Weekly chart */}
        <div className="rounded-3xl border border-line bg-cream p-6 shadow-soft xl:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-ink">نوبت‌های ۷ روز اخیر</h2>
            <span className="rounded-full bg-jade-50 px-3 py-1 text-[11px] font-extrabold text-jade-700">
              مجموع: {formatFaNumber(stats.weekly.reduce((a, b) => a + b.count, 0))} نوبت
            </span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
            {stats.weekly.map((day) => (
              <div key={day.date} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-black text-jade-700 opacity-0 transition-opacity group-hover:opacity-100">
                  {toFa(day.count)}
                </span>
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${
                    day.date === todayISO ? "bg-coral-500" : "bg-jade-600 group-hover:bg-jade-500"
                  }`}
                  style={{ height: `${Math.max(day.count > 0 ? 8 : 3, (day.count / maxWeekly) * 100)}%` }}
                />
                <div className="text-center">
                  <p className="text-[11px] font-black text-ink">{FA_WEEKDAY_TINY[weekdayOf(day.date)]}</p>
                  <p className="text-[10px] text-ink-faint">{faDayOfMonth(day.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top specialties */}
        <div className="rounded-3xl border border-line bg-cream p-6 shadow-soft xl:col-span-2">
          <h2 className="text-base font-black text-ink">پرفعالیت‌ترین تخصص‌ها</h2>
          <div className="mt-5 space-y-4">
            {stats.topSpecialties.map((s, i) => {
              const max = stats.topSpecialties[0]?.count ?? 1;
              return (
                <div key={s.name}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">
                      <span className="ms-0 me-2 grid size-5.5 inline-grid place-items-center rounded-md bg-jade-50 text-[10px] font-black text-jade-700">
                        {toFa(i + 1)}
                      </span>
                      {s.name}
                    </span>
                    <span className="font-black text-jade-700">{formatFaNumber(s.count)} پزشک</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-gradient-to-l from-jade-600 to-jade-400" style={{ width: `${(s.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Recent appointments */}
        <div className="rounded-3xl border border-line bg-cream shadow-soft xl:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-base font-black text-ink">آخرین نوبت‌های ثبت‌شده</h2>
            <Link
              href="/admin/appointments"
              className="flex items-center gap-1.5 text-xs font-extrabold text-jade-700 transition-colors hover:text-coral-600"
            >
              مشاهده همه
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-line/70">
            {stats.recent.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-ink-faint">هنوز نوبتی ثبت نشده است.</p>
            )}
            {stats.recent.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
                <span className="grid size-10 place-items-center rounded-xl bg-jade-50 text-xs font-black text-jade-700">
                  {a.patientName[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-ink">{a.patientName}</p>
                  <p className="truncate text-[11px] text-ink-faint">{a.doctor.fullName} — {a.city.name}</p>
                </div>
                <span className="hidden text-[11px] font-bold text-ink-soft sm:block" dir="ltr">
                  {a.date} · {a.time}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${STATUS_MAP[a.status]?.cls ?? "bg-sand text-ink-soft"}`}>
                  {STATUS_MAP[a.status]?.label ?? a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top doctors */}
        <div className="rounded-3xl border border-line bg-cream shadow-soft xl:col-span-2">
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-base font-black text-ink">پزشکان پرنوبت</h2>
          </div>
          <div className="divide-y divide-line/70">
            {stats.topDoctors.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-ink-faint">داده‌ای موجود نیست.</p>
            )}
            {stats.topDoctors.map((d, i) => (
              <div key={d.slug} className="flex items-center gap-3 px-6 py-3.5">
                <span className={`grid size-8 place-items-center rounded-full text-xs font-black ${i === 0 ? "bg-sun-300 text-ink" : "bg-jade-700 text-cream"}`}>
                  {toFa(i + 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-ink">{d.name}</p>
                  <p className="truncate text-[11px] text-ink-faint">{d.title}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-black text-sun-600">
                  <Star className="size-3.5 fill-sun-500 text-sun-500" strokeWidth={0} />
                  {toFa(Number(d.rating).toFixed(1))}
                </span>
                <span className="rounded-full bg-jade-50 px-2.5 py-1 text-[10px] font-black text-jade-700">
                  {formatFaNumber(d.count)} نوبت
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/appointments", icon: CircleCheck, title: "مدیریت نوبت‌ها", desc: "تایید، لغو و پیگیری نوبت‌های بیماران" },
          { href: "/admin/doctors", icon: BadgeCheck, title: "مدیریت پزشکان", desc: "فعال‌سازی، ویرایش و افزودن پزشک" },
          { href: "/admin/reviews", icon: MessageSquareText, title: "مدیریت نظرات", desc: "انتشار یا حذف نظرات بیماران" },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex items-center gap-4 rounded-3xl border border-line bg-cream p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-jade-300 hover:shadow-lift"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-jade-700 text-cream transition-colors group-hover:bg-coral-500">
              <c.icon className="size-6" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-sm font-black text-ink">{c.title}</p>
              <p className="mt-1 text-[11px] leading-5 text-ink-faint">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
