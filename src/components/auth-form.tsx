"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  KeyRound,
  Loader2,
  LogIn,
  PencilLine,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { cn, toEnDigits, toFa } from "@/lib/utils";

type Step = "phone" | "code" | "name";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  const phoneValid = /^09\d{9}$/.test(toEnDigits(phone).replace(/\D/g, ""));

  async function requestOtp() {
    if (!phoneValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ارسال کد.");
        return;
      }
      setDevCode(data.devCode ?? null);
      setSecondsLeft(data.expiresIn ?? 120);
      setStep("code");
      setCode("");
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(withName = false) {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone, code, name: withName ? name : undefined }),
      });
      const data = await res.json();
      if (data.needsName) {
        setStep("name");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "کد تایید نامعتبر است.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-7 flex items-center justify-center gap-2">
        {["شماره موبایل", "کد تایید", "تکمیل ثبت‌نام"].map((label, i) => {
          const stepIndex = step === "phone" ? 0 : step === "code" ? 1 : 2;
          const active = i <= stepIndex;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <span className={cn("h-0.5 w-6 rounded-full sm:w-10", active ? "bg-jade-600" : "bg-line")} />}
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-black transition-colors",
                  active ? "bg-jade-700 text-cream" : "bg-sand text-ink-faint"
                )}
              >
                {toFa(i + 1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: phone */}
      {step === "phone" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestOtp();
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-xs font-black text-ink">شماره موبایل</label>
            <div className="relative">
              <Smartphone className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۹۱۲۳۴۵۶۷۸۹"
                inputMode="tel"
                maxLength={11}
                className="field ps-11 !py-3.5 text-center !text-base font-bold tracking-[0.15em]"
                dir="ltr"
              />
            </div>
            {phone.length > 0 && !phoneValid && (
              <p className="mt-1.5 text-[11px] font-bold text-coral-600">شماره باید ۱۱ رقم و با ۰۹ شروع شود.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!phoneValid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-jade-700 py-4 text-sm font-black text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-jade-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
            {loading ? "در حال ارسال کد…" : "دریافت کد تایید"}
          </button>
          <p className="flex items-start gap-2 text-[11px] leading-5 text-ink-faint">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-jade-600" />
            با ورود یا ثبت‌نام، قوانین استفاده از نوبت سلامت و حریم خصوصی را می‌پذیرید.
          </p>
        </form>
      )}

      {/* STEP 2: OTP code */}
      {step === "code" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
          className="space-y-4"
        >
          <div className="rounded-2xl bg-jade-50 px-4 py-3 text-center text-sm">
            <span className="font-bold text-jade-900">کد تایید برای <span dir="ltr" className="font-black">{toFa(toEnDigits(phone).replace(/\D/g, ""))}</span> پیامک شد</span>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
              className="mt-1 flex items-center gap-1.5 mx-auto text-[11px] font-extrabold text-coral-600 transition-colors hover:text-coral-700"
            >
              <PencilLine className="size-3.5" />
              ویرایش شماره
            </button>
          </div>

          {/* Demo code box (no SMS gateway in sandbox) */}
          {devCode && (
            <div className="rounded-2xl border border-dashed border-sun-500/60 bg-sun-100/60 px-4 py-3 text-center">
              <p className="text-[11px] font-bold text-sun-600">حالت دمو — در نسخه نهایی این کد پیامک می‌شود</p>
              <p className="mt-1 text-2xl font-black tracking-[0.4em] text-ink" dir="ltr">{devCode}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-black text-ink">کد تایید ۵ رقمی</label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
              <input
                ref={codeRef}
                value={code}
                onChange={(e) => setCode(toEnDigits(e.target.value).replace(/\D/g, "").slice(0, 5))}
                placeholder="ــــــ"
                inputMode="numeric"
                className="field ps-11 !py-3.5 text-center !text-2xl font-black tracking-[0.45em]"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={code.length !== 5 || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-coral-500 py-4 text-sm font-black text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="size-5 animate-spin" />}
            {loading ? "در حال بررسی…" : "تایید و ورود"}
          </button>

          <div className="text-center text-xs">
            {secondsLeft > 0 ? (
              <p className="font-bold text-ink-faint">
                ارسال مجدد کد تا <span className="font-black text-jade-700">{toFa(Math.floor(secondsLeft / 60))}:{toFa(String(secondsLeft % 60).padStart(2, "0"))}</span> دیگر
              </p>
            ) : (
              <button
                type="button"
                onClick={requestOtp}
                disabled={loading}
                className="font-extrabold text-jade-700 transition-colors hover:text-coral-600"
              >
                ارسال مجدد کد تایید
              </button>
            )}
          </div>
        </form>
      )}

      {/* STEP 3: name (first-time registration) */}
      {step === "name" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify(true);
          }}
          className="space-y-4"
        >
          <div className="rounded-2xl bg-jade-50 px-4 py-3 text-center text-sm font-bold leading-7 text-jade-900">
            خوش آمدید! برای تکمیل ثبت‌نام،
            <br />
            نام خود را وارد کنید.
          </div>
          <div>
            <label className="mb-2 block text-xs font-black text-ink">نام و نام خانوادگی</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً زهرا احمدی"
                className="field ps-11 !py-3.5"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={name.trim().length < 3 || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-coral-500 py-4 text-sm font-black text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="size-5 animate-spin" />}
            {loading ? "در حال ثبت…" : "تکمیل ثبت‌نام"}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3 text-xs font-bold text-coral-700">
          <CircleAlert className="size-4.5 shrink-0" />
          {error}
        </p>
      )}

      <button
        onClick={() => router.push("/")}
        className="mx-auto mt-6 flex items-center gap-1.5 text-xs font-bold text-ink-faint transition-colors hover:text-jade-700"
        type="button"
      >
        <ArrowRight className="size-3.5" />
        بازگشت به صفحه اصلی
      </button>
    </div>
  );
}
