"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarCheck2,
  CheckCheck,
  CircleAlert,
  ClipboardCopy,
  Loader2,
  MapPin,
  PartyPopper,
  RotateCcw,
  Video,
} from "lucide-react";
import { cn, formatFaDate, formatToman, toEnDigits, toFa } from "@/lib/utils";

export interface DateCard {
  iso: string;
  weekdayTiny: string;
  day: string;
  month: string;
}

interface Slot {
  time: string;
  available: boolean;
}

interface BookingWidgetProps {
  doctorId: number;
  doctorName: string;
  consultPrice: number;
  onlinePrice: number | null;
  onlineConsult: boolean;
  clinicAddress: string | null;
  cityName: string;
  dates: DateCard[];
}

type Phase = "pick" | "success";

export function BookingWidget(props: BookingWidgetProps) {
  const { doctorId, doctorName, onlineConsult, dates } = props;
  const [type, setType] = useState<"inperson" | "online">("inperson");
  const [dateIso, setDateIso] = useState(dates[0]?.iso ?? "");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [national, setNational] = useState("");

  /* Prefill patient info when logged in */
  useEffect(() => {
    fetch("/api/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.patient) {
          setName((prev) => prev || (data.patient.fullName !== "کاربر نوبت سلامت" ? data.patient.fullName : ""));
          setPhone((prev) => prev || data.patient.phone || "");
        }
      })
      .catch(() => {});
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [trackingCode, setTrackingCode] = useState("");
  const [copied, setCopied] = useState(false);

  const price = type === "online" ? (props.onlinePrice ?? props.consultPrice) : props.consultPrice;

  /* Load slots whenever the selected date changes */
  useEffect(() => {
    if (!dateIso) return;
    const controller = new AbortController();
    setSlotsLoading(true);
    setSlots(null);
    setSlot(null);
    fetch(`/api/doctors/${doctorId}/slots?date=${dateIso}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { slots?: Slot[] }) => {
        if (!controller.signal.aborted) setSlots(data.slots ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });
    return () => controller.abort();
  }, [dateIso, doctorId]);

  const phoneValid = useMemo(() => /^09\d{9}$/.test(toEnDigits(phone.trim())), [phone]);
  const nameValid = name.trim().length >= 3;
  const canSubmit = Boolean(slot) && nameValid && phoneValid && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date: dateIso,
          time: slot,
          type,
          patientName: name.trim(),
          patientPhone: phone.trim(),
          nationalCode: national.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطایی رخ داد. دوباره تلاش کنید.");
        return;
      }
      setTrackingCode(data.trackingCode);
      setPhase("success");
    } catch {
      setError("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setPhase("pick");
    setSlot(null);
    setError(null);
    setTrackingCode("");
    // Refresh slots for current date
    setDateIso((d) => `${d}`);
    setSlots(null);
  }

  /* ----------------------------- SUCCESS ----------------------------- */
  if (phase === "success") {
    return (
      <div className="overflow-hidden rounded-3xl border border-jade-200 bg-cream shadow-lift">
        <div className="bg-jade-700 px-6 py-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-cream/15">
            <PartyPopper className="size-8 text-cream" />
          </span>
          <h3 className="mt-4 text-xl font-black text-cream">نوبت شما رزرو شد!</h3>
          <p className="mt-1.5 text-sm text-jade-100">پیامک تایید برای شما ارسال خواهد شد.</p>
        </div>

        <div className="p-6">
          <p className="text-center text-xs font-bold text-ink-faint">کد پیگیری نوبت</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="rounded-xl bg-jade-50 px-5 py-2.5 text-2xl font-black tracking-[0.2em] text-jade-800" dir="ltr">
              {trackingCode}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(trackingCode).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="grid size-11 place-items-center rounded-xl border border-line bg-cream text-ink-soft transition-colors hover:border-jade-400 hover:text-jade-700"
              aria-label="کپی کد"
            >
              {copied ? <CheckCheck className="size-5 text-jade-600" /> : <ClipboardCopy className="size-5" />}
            </button>
          </div>

          <dl className="mt-6 space-y-3 rounded-2xl border border-line bg-paper p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">پزشک</dt>
              <dd className="font-extrabold text-ink">{doctorName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">زمان نوبت</dt>
              <dd className="font-extrabold text-ink">
                {formatFaDate(dateIso)} — {toFa(slot ?? "")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">نوع ویزیت</dt>
              <dd className="font-extrabold text-ink">{type === "online" ? "مشاوره آنلاین" : "حضوری در مطب"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-dashed border-line pt-3">
              <dt className="text-ink-faint">هزینه ویزیت</dt>
              <dd className="font-black text-jade-800">{formatToman(price)}</dd>
            </div>
          </dl>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link
              href={`/track?code=${trackingCode}`}
              className="rounded-xl bg-coral-500 py-3 text-center text-sm font-extrabold text-cream transition-colors hover:bg-coral-600"
            >
              پیگیری نوبت
            </Link>
            <button
              type="button"
              onClick={reset}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-line py-3 text-sm font-extrabold text-ink-soft transition-colors hover:border-jade-400 hover:text-jade-700"
            >
              <RotateCcw className="size-4" />
              رزرو جدید
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------- PICK FLOW ----------------------------- */
  return (
    <div className="rounded-3xl border border-line bg-cream p-5 shadow-lift sm:p-6">
      <h3 className="flex items-center gap-2.5 text-base font-black text-ink">
        <span className="grid size-9 place-items-center rounded-xl bg-coral-100">
          <CalendarCheck2 className="size-5 text-coral-600" />
        </span>
        دریافت نوبت آنلاین
      </h3>

      {/* Visit type */}
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-sand/70 p-1.5">
        <button
          type="button"
          onClick={() => setType("inperson")}
          className={cn(
            "rounded-xl px-3 py-2.5 text-center transition-all",
            type === "inperson" ? "bg-jade-700 text-cream shadow-soft" : "text-ink-soft hover:bg-cream"
          )}
        >
          <span className="flex items-center justify-center gap-1.5 text-xs font-extrabold">
            <Building2 className="size-4" />
            ویزیت حضوری
          </span>
          <span className={cn("mt-1 block text-[11px] font-bold", type === "inperson" ? "text-jade-100" : "text-ink-faint")}>
            {formatToman(props.consultPrice)}
          </span>
        </button>
        {onlineConsult ? (
          <button
            type="button"
            onClick={() => setType("online")}
            className={cn(
              "rounded-xl px-3 py-2.5 text-center transition-all",
              type === "online" ? "bg-jade-700 text-cream shadow-soft" : "text-ink-soft hover:bg-cream"
            )}
          >
            <span className="flex items-center justify-center gap-1.5 text-xs font-extrabold">
              <Video className="size-4" />
              مشاوره آنلاین
            </span>
            <span className={cn("mt-1 block text-[11px] font-bold", type === "online" ? "text-jade-100" : "text-ink-faint")}>
              {formatToman(props.onlinePrice)}
            </span>
          </button>
        ) : (
          <div className="grid place-items-center rounded-xl border border-dashed border-line px-3 py-2.5 text-center text-[11px] font-bold text-ink-faint">
            مشاوره آنلاین فعال نیست
          </div>
        )}
      </div>

      {/* Date picker */}
      <p className="mt-6 mb-2.5 text-xs font-black text-ink">روز ویزیت</p>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {dates.map((d) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => setDateIso(d.iso)}
            className={cn(
              "flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition-all",
              d.iso === dateIso
                ? "border-jade-700 bg-jade-700 text-cream shadow-soft"
                : "border-line bg-paper text-ink-soft hover:border-jade-400"
            )}
          >
            <span className={cn("text-[10px] font-bold", d.iso === dateIso ? "text-jade-200" : "text-ink-faint")}>
              {d.weekdayTiny}
            </span>
            <span className="mt-1 text-lg font-black">{d.day}</span>
            <span className={cn("text-[10px] font-bold", d.iso === dateIso ? "text-jade-200" : "text-ink-faint")}>
              {d.month}
            </span>
          </button>
        ))}
      </div>

      {/* Slots */}
      <p className="mt-5 mb-2.5 text-xs font-black text-ink">ساعت‌های خالی — {formatFaDate(dateIso, { weekday: "long", day: "numeric", month: "long" })}</p>
      {slotsLoading || slots === null ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-10 animate-pulse rounded-xl bg-sand" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-paper px-4 py-6 text-center text-xs font-bold text-ink-faint">
          پزشک در این روز نوبت آزاد ندارد؛ روز دیگری را انتخاب کنید.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {slots.map((s) => (
            <button
              key={s.time}
              type="button"
              disabled={!s.available}
              onClick={() => setSlot(s.time)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-extrabold transition-all",
                !s.available && "cursor-not-allowed border-line/60 bg-paper text-line line-through",
                s.available && slot !== s.time && "border-line bg-cream text-ink hover:border-jade-500 hover:text-jade-700",
                s.available && slot === s.time && "border-coral-500 bg-coral-500 text-cream shadow-soft"
              )}
            >
              {toFa(s.time)}
            </button>
          ))}
        </div>
      )}

      {/* Patient form */}
      <div className="mt-6 space-y-3 border-t border-dashed border-line pt-5">
        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام و نام خانوادگی بیمار *"
            className={cn("field", name.length > 0 && !nameValid && "!border-coral-400")}
          />
          {name.length > 0 && !nameValid && (
            <p className="mt-1.5 text-[11px] font-bold text-coral-600">نام باید حداقل ۳ حرف باشد.</p>
          )}
        </div>
        <div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="شماره موبایل (۰۹۱۲…) *"
            inputMode="tel"
            className={cn("field", phone.length > 0 && !phoneValid && "!border-coral-400")}
            dir="ltr"
            style={{ textAlign: "right" }}
          />
          {phone.length > 0 && !phoneValid && (
            <p className="mt-1.5 text-[11px] font-bold text-coral-600">شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.</p>
          )}
        </div>
        <input
          value={national}
          onChange={(e) => setNational(e.target.value)}
          placeholder="کد ملی (اختیاری)"
          inputMode="numeric"
          className="field"
        />
      </div>

      {/* Location hint */}
      {type === "inperson" && props.clinicAddress && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-jade-50 px-3.5 py-2.5 text-[11px] font-bold leading-5 text-jade-800">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          {props.cityName} — {props.clinicAddress}
        </p>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-coral-50 px-3.5 py-3 text-xs font-bold leading-6 text-coral-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Summary + CTA */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-jade-950 px-4 py-3.5 text-cream">
        <div className="text-xs leading-5">
          <p className="font-black">{slot ? `${formatFaDate(dateIso, { weekday: "long", day: "numeric", month: "long" })} — ${toFa(slot)}` : "ساعتی انتخاب نشده"}</p>
          <p className="text-jade-200/80">{type === "online" ? "مشاوره آنلاین" : "ویزیت حضوری"}</p>
        </div>
        <p className="text-lg font-black text-sun-300">{formatToman(price)}</p>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black transition-all",
          canSubmit
            ? "animate-pulse-ring bg-coral-500 text-cream hover:bg-coral-600"
            : "cursor-not-allowed bg-sand text-ink-faint"
        )}
      >
        {submitting && <Loader2 className="size-5 animate-spin" />}
        {submitting ? "در حال ثبت نوبت…" : slot ? "تایید و رزرو نوبت" : "ابتدا ساعت نوبت را انتخاب کنید"}
      </button>

      <p className="mt-3 text-center text-[11px] leading-5 text-ink-faint">
        ثبت نوبت رایگان است؛ هزینه ویزیت در مطب یا درگاه امن پرداخت می‌شود.
      </p>
    </div>
  );
}
