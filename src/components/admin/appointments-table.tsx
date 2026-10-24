"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Ban, CheckCircle2, Loader2, Phone } from "lucide-react";
import type { AdminAppointment } from "@/lib/admin-queries";
import { cn, formatFaDate, formatToman, toFa } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "تایید شده", cls: "bg-jade-50 text-jade-700 ring-jade-200" },
  completed: { label: "انجام شده", cls: "bg-sun-100 text-sun-600 ring-sun-300" },
  cancelled: { label: "لغو شده", cls: "bg-coral-50 text-coral-600 ring-coral-200" },
};

export function AppointmentsTable({ items }: { items: AdminAppointment[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  async function update(id: number, status: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-cream px-6 py-16 text-center">
        <p className="text-sm font-bold text-ink-faint">نوبتی با این مشخصات یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-xs text-ink-faint">
              <th className="px-5 py-3.5 text-start font-black">کد پیگیری</th>
              <th className="px-5 py-3.5 text-start font-black">بیمار</th>
              <th className="px-5 py-3.5 text-start font-black">پزشک</th>
              <th className="px-5 py-3.5 text-start font-black">زمان نوبت</th>
              <th className="px-5 py-3.5 text-start font-black">نوع</th>
              <th className="px-5 py-3.5 text-start font-black">مبلغ</th>
              <th className="px-5 py-3.5 text-start font-black">وضعیت</th>
              <th className="px-5 py-3.5 text-start font-black">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {items.map((a) => {
              const st = STATUS_MAP[a.status] ?? { label: a.status, cls: "bg-sand text-ink-faint ring-line" };
              const busy = busyId === a.id;
              return (
                <tr key={a.id} className="transition-colors hover:bg-paper/70">
                  <td className="px-5 py-4">
                    <span className="font-black tracking-widest text-jade-800" dir="ltr">{a.trackingCode}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-extrabold text-ink">{a.patientName}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-faint" dir="ltr">
                      <Phone className="size-3" />
                      {toFa(a.patientPhone)}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-ink-soft">{a.doctor.fullName}</td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-ink">{formatFaDate(a.date, { weekday: "short", day: "numeric", month: "short" })}</p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">ساعت {toFa(a.time)}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-ink-soft">
                    {a.type === "online" ? "آنلاین" : "حضوری"}
                  </td>
                  <td className="px-5 py-4 text-xs font-black text-ink">{formatToman(a.price)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ring-inset ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {busy ? (
                      <Loader2 className="size-4.5 animate-spin text-jade-600" />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {a.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => update(a.id, "completed")}
                              className="grid size-8 place-items-center rounded-lg bg-jade-50 text-jade-700 transition-colors hover:bg-jade-600 hover:text-cream"
                              title="علامت به‌عنوان انجام‌شده"
                            >
                              <CheckCircle2 className="size-4.5" />
                            </button>
                            <button
                              onClick={() => update(a.id, "cancelled")}
                              className={cn("grid size-8 place-items-center rounded-lg bg-coral-50 text-coral-600 transition-colors hover:bg-coral-500 hover:text-cream")}
                              title="لغو نوبت"
                            >
                              <Ban className="size-4.5" />
                            </button>
                          </>
                        )}
                        {a.status === "cancelled" && (
                          <button
                            onClick={() => update(a.id, "confirmed")}
                            className="rounded-lg bg-jade-50 px-3 py-1.5 text-[11px] font-extrabold text-jade-700 transition-colors hover:bg-jade-600 hover:text-cream"
                          >
                            بازگردانی
                          </button>
                        )}
                        {a.status === "completed" && <span className="text-[11px] text-ink-faint">—</span>}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
