"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Ban,
  Building2,
  CalendarDays,
  CircleCheck,
  CircleX,
  Loader2,
  LogOut,
  ScanSearch,
  Trash2,
  Video,
} from "lucide-react";
import { cn, formatFaDate, formatToman, toFa } from "@/lib/utils";

export interface ProfileAppointment {
  trackingCode: string;
  status: string;
  type: string;
  date: string;
  time: string;
  price: number;
  doctor: { name: string; title: string; slug: string };
  city: string;
  specialty: string;
}

const STATUS: Record<string, { label: string; cls: string; icon: typeof CircleCheck }> = {
  confirmed: { label: "تایید شده", cls: "bg-jade-50 text-jade-700 border-jade-200", icon: CircleCheck },
  completed: { label: "انجام شده", cls: "bg-sun-100 text-sun-600 border-sun-200", icon: CircleCheck },
  cancelled: { label: "لغو شده", cls: "bg-coral-50 text-coral-600 border-coral-200", icon: CircleX },
};

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      router.push("/");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-extrabold text-jade-100 transition-colors hover:border-coral-400 hover:bg-coral-500 hover:text-cream"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      خروج
    </button>
  );
}

export function ProfileAppointments({ items }: { items: ProfileAppointment[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function cancel(trackingCode: string) {
    if (!confirm("نوبت شما لغو شود؟ این عمل قابل بازگشت نیست.")) return;
    setBusy(trackingCode);
    try {
      const res = await fetch("/api/patient/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "خطا در لغو نوبت.");
        return;
      }
      router.refresh();
    } catch {
      alert("ارتباط با سرور برقرار نشد.");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-cream px-6 py-16 text-center">
        <CalendarDays className="mx-auto size-12 text-jade-300" />
        <p className="mt-4 font-black text-ink">هنوز نوبتی ندارید</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-ink-soft">
          اولین نوبت خود را از میان هزاران پزشک متخصص رزرو کنید — سریع و بدون کارمزد.
        </p>
        <Link
          href="/doctors"
          className="mt-6 inline-block rounded-xl bg-jade-700 px-6 py-3 text-sm font-extrabold text-cream transition-colors hover:bg-jade-800"
        >
          یافتن پزشک
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((a) => {
        const st = STATUS[a.status] ?? STATUS.confirmed;
        const TypeIcon = a.type === "online" ? Video : Building2;
        return (
          <article
            key={a.trackingCode}
            className={cn(
              "animate-fade-up rounded-3xl border bg-cream p-5 shadow-soft transition-all sm:p-6",
              a.status === "cancelled" ? "border-line opacity-70" : "border-line hover:border-jade-300"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="grid size-13 place-items-center rounded-2xl bg-jade-50">
                  <TypeIcon className="size-6 text-jade-700" strokeWidth={1.8} />
                </span>
                <div>
                  <Link href={`/doctors/${a.doctor.slug}`} className="font-black text-ink transition-colors hover:text-jade-700">
                    {a.doctor.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {a.specialty} — {a.city}
                  </p>
                </div>
              </div>
              <span className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-extrabold ${st.cls}`}>
                <st.icon className="size-4" />
                {st.label}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-paper p-4 text-sm sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold text-ink-faint">تاریخ نوبت</p>
                <p className="mt-1 font-extrabold text-ink">{formatFaDate(a.date, { weekday: "long", day: "numeric", month: "long" })}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink-faint">ساعت</p>
                <p className="mt-1 font-extrabold text-ink">{toFa(a.time)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink-faint">کد پیگیری</p>
                <p className="mt-1 font-black tracking-widest text-jade-800" dir="ltr">{a.trackingCode}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-ink-faint">هزینه</p>
                <p className="mt-1 font-extrabold text-ink">{formatToman(a.price)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/track?code=${a.trackingCode}`}
                className="flex items-center gap-1.5 rounded-lg bg-jade-50 px-3.5 py-2 text-xs font-extrabold text-jade-700 transition-colors hover:bg-jade-700 hover:text-cream"
              >
                <ScanSearch className="size-4" />
                جزئیات نوبت
              </Link>
              {a.status === "confirmed" && (
                <button
                  onClick={() => cancel(a.trackingCode)}
                  disabled={busy === a.trackingCode}
                  className="flex items-center gap-1.5 rounded-lg bg-coral-50 px-3.5 py-2 text-xs font-extrabold text-coral-600 transition-colors hover:bg-coral-500 hover:text-cream"
                >
                  {busy === a.trackingCode ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                  لغو نوبت
                </button>
              )}
              {a.status === "cancelled" && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-faint">
                  <Trash2 className="size-3.5" />
                  این نوبت لغو شده است
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
