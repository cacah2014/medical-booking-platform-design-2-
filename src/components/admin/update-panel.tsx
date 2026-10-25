"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  CircleAlert,
  CircleDot,
  Database,
  GitBranch,
  Hammer,
  Loader2,
  Minus,
  Package,
  RefreshCcw,
  Rocket,
  TerminalSquare,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "running" | "done" | "failed" | "skipped";

interface UpdateStatus {
  running: boolean;
  commit: string | null;
  steps: { name: string; status: StepStatus }[];
  logTail: string;
  git: {
    available: boolean;
    current: string | null;
    subject: string | null;
    latest: string | null;
    updateAvailable: boolean;
  };
}

const STEP_ICONS = [ArrowDownToLine, Package, Database, Hammer, RefreshCcw];

function StepIcon({ status, index }: { status: StepStatus; index: number }) {
  const Icon = STEP_ICONS[index] ?? CircleDot;
  if (status === "running") return <Loader2 className="size-5 animate-spin text-jade-700" />;
  if (status === "done") return <CheckCircle2 className="size-5 text-jade-600" />;
  if (status === "failed") return <XCircle className="size-5 text-coral-600" />;
  if (status === "skipped") return <Minus className="size-5 text-ink-faint" />;
  return <Icon className="size-5 text-ink-faint" />;
}

export function UpdatePanel() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const logRef = useRef<HTMLPreElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/update", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } catch {
      /* ignore transient */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    logRef.current?.scrollTo(0, logRef.current.scrollHeight);
  }, [status?.logTail]);

  async function startUpdate() {
    if (
      !confirm(
        "به‌روزرسانی پروژه شروع شود؟\n\n۱) git pull\n۲) نصب وابستگی‌ها\n۳) به‌روزرسانی دیتابیس\n۴) بیلد کد\n۵) ری‌استارت سرویس\n\nسایت در طول ری‌استارت چند ثانیه ممکن است در دسترس نباشد."
      )
    )
      return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/update", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "خطا در شروع به‌روزرسانی.");
        return;
      }
      await load();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setStarting(false);
    }
  }

  const anyFailed = status?.steps.some((s) => s.status === "failed");
  const allSettled =
    status && !status.running && status.steps.filter((s) => s.status === "pending").length < status.steps.length;

  return (
    <div className="space-y-6">
      {/* Commit info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-line bg-cream p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-black text-ink-faint">
            <GitBranch className="size-4 text-jade-700" />
            نسخه فعلی روی سرور
          </p>
          <p className="mt-2 font-mono text-lg font-black text-jade-800" dir="ltr">
            {status?.git.current ?? "—"}
          </p>
          <p className="mt-1 truncate text-xs text-ink-soft">{status?.git.subject ?? "مخزن Git نامشخص"}</p>
        </div>
        <div className="rounded-3xl border border-line bg-cream p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-black text-ink-faint">
            <RefreshCcw className="size-4 text-coral-500" />
            آخرین نسخه در GitHub
          </p>
          <p className="mt-2 font-mono text-lg font-black text-ink" dir="ltr">
            {status?.git.latest ?? "—"}
          </p>
          {status?.git.available &&
            (status.git.updateAvailable ? (
              <p className="mt-1 text-xs font-extrabold text-coral-600">نسخه جدیدی برای نصب موجود است</p>
            ) : (
              <p className="mt-1 text-xs font-extrabold text-jade-700">سرویس به‌روز است</p>
            ))}
        </div>
      </div>

      {/* Trigger */}
      <div className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-ink">به‌روزرسانی خودکار از Git</h2>
            <p className="mt-1 text-xs leading-6 text-ink-soft">
              ترتیب اجرا: git pull ← Dependency ← Database ← Code ← Update (ری‌استارت)
            </p>
          </div>
          <button
            onClick={startUpdate}
            disabled={starting || status?.running}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl px-7 py-4 text-sm font-black text-cream shadow-lift transition-all",
              starting || status?.running
                ? "cursor-not-allowed bg-ink-faint"
                : "bg-coral-500 hover:-translate-y-0.5 hover:bg-coral-600"
            )}
          >
            {starting || status?.running ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Rocket className="size-5" />
            )}
            {status?.running ? "در حال به‌روزرسانی…" : "بروزرسانی پروژه"}
          </button>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3 text-xs font-bold text-coral-700">
            <CircleAlert className="size-4.5" />
            {error}
          </p>
        )}
        {allSettled && !anyFailed && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-jade-50 px-4 py-3 text-xs font-bold text-jade-700">
            <CheckCircle2 className="size-4.5" />
            به‌روزرسانی کامل شد — کامیت فعلی: <span className="font-mono" dir="ltr">{status.commit}</span>
          </p>
        )}
        {anyFailed && (
          <p className="mt-4 flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3 text-xs font-bold text-coral-700">
            <XCircle className="size-4.5" />
            یکی از مراحل شکست خورد — نسخه قبلی سایت سالم مانده است. لاگ پایین را بررسی کنید.
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
        <h3 className="mb-4 text-sm font-black text-ink">مراحل به‌روزرسانی</h3>
        <ol className="space-y-2.5">
          {(status?.steps ?? []).map((step, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all",
                step.status === "running" && "border-jade-400 bg-jade-50 shadow-soft",
                step.status === "done" && "border-jade-200 bg-cream",
                step.status === "failed" && "border-coral-200 bg-coral-50",
                (step.status === "pending" || step.status === "skipped") && "border-line bg-paper"
              )}
            >
              <StepIcon status={step.status} index={i} />
              <span
                className={cn(
                  "text-sm font-bold",
                  step.status === "running" ? "text-jade-900" : step.status === "pending" ? "text-ink-faint" : "text-ink"
                )}
              >
                {step.name}
              </span>
              <span className="ms-auto text-[11px] font-extrabold">
                {step.status === "running" && <span className="text-jade-700">در حال اجرا…</span>}
                {step.status === "done" && <span className="text-jade-700">✓ انجام شد</span>}
                {step.status === "failed" && <span className="text-coral-600">خطا</span>}
                {step.status === "skipped" && <span className="text-ink-faint">رد شد</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Log console */}
      <div className="rounded-3xl border border-jade-950 bg-jade-950 p-5 shadow-pop">
        <p className="mb-3 flex items-center gap-2 text-xs font-black text-jade-300">
          <TerminalSquare className="size-4.5" />
          خروجی زنده ترمینال
        </p>
        <pre
          ref={logRef}
          dir="ltr"
          className="thin-scroll h-64 overflow-y-auto rounded-2xl bg-black/40 p-4 text-left font-mono text-[11px] leading-5 text-jade-100/90"
        >
          {status?.logTail?.trim() ? status.logTail.replace(/^##STEP:.*$/gm, "").trim() || "// در انتظار شروع به‌روزرسانی…" : "// در انتظار شروع به‌روزرسانی…"}
        </pre>
      </div>
    </div>
  );
}
