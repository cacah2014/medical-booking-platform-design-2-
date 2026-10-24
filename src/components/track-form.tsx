"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  CircleCheck,
  CircleX,
  ClipboardList,
  Loader2,
  MapPin,
  Phone,
  ScanSearch,
  Video,
} from "lucide-react";
import { cn, formatFaDate, formatToman, toFa } from "@/lib/utils";

interface TrackResult {
  trackingCode: string;
  status: string;
  type: string;
  date: string;
  time: string;
  price: number;
  patientName: string;
  doctor: {
    name: string;
    title: string;
    slug: string;
    clinicAddress: string | null;
    clinicPhone: string | null;
    city: string;
    specialty: string;
  };
}

export function TrackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code") ?? "";

  const [code, setCode] = useState(urlCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  const lookup = useCallback(async (lookupCode: string) => {
    const clean = lookupCode.trim().toUpperCase();
    if (clean.length < 4) {
      setError("کد پیگیری را کامل وارد کنید. مثال: NS-4F8K2Q");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/appointments?code=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "نوبتی یافت نشد.");
        return;
      }
      setResult(data as TrackResult);
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Auto-lookup when arriving with ?code= */
  useEffect(() => {
    if (urlCode) {
      setCode(urlCode);
      lookup(urlCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode]);

  const steps = [
    { label: "ثبت نوبت", done: true },
    { label: "تایید پزشک", done: result?.status === "confirmed" || result?.status === "completed" },
    { label: "انجام ویزیت", done: result?.status === "completed" },
  ];

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/track?code=${encodeURIComponent(code.trim().toUpperCase())}`, { scroll: false });
          lookup(code);
        }}
        className="mx-auto flex max-w-xl flex-col gap-2 sm:flex-row"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="کد پیگیری — مثال: NS-4F8K2Q"
          className="field flex-1 !py-3.5 text-center !text-base font-black tracking-[0.25em]"
          dir="ltr"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-jade-700 px-8 py-3.5 text-sm font-black text-cream transition-colors hover:bg-jade-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4.5 animate-spin" /> : <ScanSearch className="size-4.5" />}
          استعلام
        </button>
      </form>

      {error && (
        <p className="mx-auto mt-6 flex max-w-xl items-center gap-2.5 rounded-2xl border border-coral-200 bg-coral-50 px-5 py-4 text-sm font-bold text-coral-700">
          <CircleX className="size-5 shrink-0" />
          {error}
        </p>
      )}

      {result && (
        <div className="mx-auto mt-8 max-w-2xl animate-fade-up">
          {/* Status banner */}
          <div className="flex items-center justify-between rounded-t-[1.75rem] bg-jade-950 px-6 py-5 text-cream">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-jade-800">
                <BadgeCheck className="size-6 text-sun-300" />
              </span>
              <div>
                <p className="text-sm font-black">
                  {result.status === "confirmed" ? "نوبت تایید شده" : result.status === "completed" ? "ویزیت انجام شده" : "نوبت لغو شده"}
                </p>
                <p className="text-xs text-jade-200/80">کد پیگیری: <span dir="ltr" className="font-black tracking-widest">{result.trackingCode}</span></p>
              </div>
            </div>
            <span className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-extrabold",
              result.status === "cancelled" ? "bg-coral-500 text-cream" : "bg-jade-700 text-jade-100"
            )}>
              {result.type === "online" ? "مشاوره آنلاین" : "حضوری"}
            </span>
          </div>

          {/* Body */}
          <div className="rounded-b-[1.75rem] border border-t-0 border-line bg-cream p-6 shadow-lift sm:p-8">
            {/* Doctor */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/doctors/${result.doctor.slug}`} className="text-lg font-black text-ink transition-colors hover:text-jade-700">
                  {result.doctor.name}
                </Link>
                <p className="mt-1 text-xs font-bold text-jade-700">{result.doctor.title}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
                  <MapPin className="size-4 text-coral-500" />
                  {result.doctor.city}
                  {result.type !== "online" && result.doctor.clinicAddress ? ` — ${result.doctor.clinicAddress}` : ""}
                </p>
                {result.doctor.clinicPhone && (
                  <a href={`tel:${result.doctor.clinicPhone}`} className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-jade-700">
                    <Phone className="size-4 text-coral-500" />
                    <span dir="ltr">{toFa(result.doctor.clinicPhone)}</span>
                  </a>
                )}
              </div>
              <div className="rounded-2xl bg-paper px-5 py-4 text-center">
                <CalendarClock className="mx-auto size-6 text-jade-700" />
                <p className="mt-2 text-sm font-black text-ink">{formatFaDate(result.date)}</p>
                <p className="mt-0.5 text-xs font-bold text-ink-soft">ساعت {toFa(result.time)}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-8 grid grid-cols-3 gap-2">
              {steps.map((step, i) => (
                <div key={step.label} className="relative text-center">
                  {i < steps.length - 1 && (
                    <span
                      className={cn(
                        "absolute start-[calc(50%+18px)] top-3.5 h-0.5 w-[calc(100%-36px)] rounded-full",
                        steps[i + 1].done ? "bg-jade-600" : "bg-line"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 mx-auto grid size-7 place-items-center rounded-full",
                      step.done ? "bg-jade-600 text-cream" : "bg-sand text-ink-faint"
                    )}
                  >
                    <CircleCheck className="size-4" />
                  </span>
                  <p className={cn("mt-2 text-[11px] font-extrabold", step.done ? "text-jade-800" : "text-ink-faint")}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Details */}
            <dl className="mt-8 grid gap-3 rounded-2xl border border-line bg-paper p-5 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 sm:block">
                <dt className="text-xs text-ink-faint">نام بیمار</dt>
                <dd className="font-extrabold text-ink sm:mt-1">{result.patientName}</dd>
              </div>
              <div className="flex justify-between gap-3 sm:block">
                <dt className="text-xs text-ink-faint">هزینه ویزیت</dt>
                <dd className="font-extrabold text-jade-800 sm:mt-1">{formatToman(result.price)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {result.type === "online" ? (
                <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-jade-700 px-5 py-3.5 text-sm font-extrabold text-cream">
                  <Video className="size-4.5" />
                  لینک جلسه قبل از نوبت پیامک می‌شود
                </span>
              ) : (
                <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-jade-700 px-5 py-3.5 text-sm font-extrabold text-cream">
                  <Building2 className="size-4.5" />
                  لطفاً ۱۵ دقیقه زودتر در مطب حضور داشته باشید
                </span>
              )}
              <Link
                href="/doctors"
                className="flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3.5 text-sm font-extrabold text-ink-soft transition-colors hover:border-jade-400 hover:text-jade-700"
              >
                <ClipboardList className="size-4.5" />
                رزرو نوبت جدید
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
