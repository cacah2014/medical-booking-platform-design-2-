"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { DoctorAvatar } from "@/components/doctor-avatar";
import type { AdminDoctor } from "@/lib/admin-queries";
import { cn, formatFaNumber, formatToman, toFa } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5.5 w-10 rounded-full p-0.5 transition-colors disabled:opacity-50",
        checked ? "bg-jade-600" : "bg-line"
      )}
      aria-label={label}
    >
      <span
        className={cn(
          "block size-4.5 rounded-full bg-cream shadow transition-transform",
          checked && "-translate-x-4.5"
        )}
      />
    </button>
  );
}

export function DoctorsTable({ items }: { items: AdminDoctor[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patch(id: number, body: { isActive?: boolean; onlineConsult?: boolean }) {
    setBusyId(`${id}-${Object.keys(body)[0]}`);
    try {
      const res = await fetch("/api/admin/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-cream shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line bg-paper text-xs text-ink-faint">
              <th className="px-5 py-3.5 text-start font-black">پزشک</th>
              <th className="px-5 py-3.5 text-start font-black">تخصص / شهر</th>
              <th className="px-5 py-3.5 text-start font-black">امتیاز</th>
              <th className="px-5 py-3.5 text-start font-black">نوبت‌ها</th>
              <th className="px-5 py-3.5 text-start font-black">هزینه ویزیت</th>
              <th className="px-5 py-3.5 text-center font-black">مشاوره آنلاین</th>
              <th className="px-5 py-3.5 text-center font-black">فعال در سایت</th>
              <th className="px-5 py-3.5 text-start font-black">پروفایل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {items.map((d) => (
              <tr key={d.id} className={cn("transition-colors hover:bg-paper/70", !d.isActive && "opacity-60")}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <DoctorAvatar
                      image={d.image}
                      name={d.fullName}
                      className="size-11 rounded-xl object-cover"
                      textClassName="text-sm"
                    />
                    <div>
                      <p className="font-extrabold text-ink">{d.fullName}</p>
                      <p className="mt-0.5 text-[11px] text-ink-faint">کد نظام: {d.medicalCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs font-bold text-ink">{d.specialty.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">{d.city.name}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1 text-xs font-black text-ink">
                    <Star className="size-3.5 fill-sun-500 text-sun-500" strokeWidth={0} />
                    {toFa(Number(d.rating).toFixed(1))}
                    <span className="font-medium text-ink-faint">({formatFaNumber(d.reviewsCount)})</span>
                  </span>
                </td>
                <td className="px-5 py-4 text-xs font-black text-jade-700">{formatFaNumber(d.appointmentsCount)}</td>
                <td className="px-5 py-4 text-xs font-bold text-ink">{formatToman(d.consultPrice)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-center">
                    <Toggle
                      checked={d.onlineConsult}
                      disabled={busyId === `${d.id}-onlineConsult`}
                      onChange={(v) => patch(d.id, { onlineConsult: v })}
                      label="تغییر وضعیت مشاوره آنلاین"
                    />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-center">
                    <Toggle
                      checked={d.isActive}
                      disabled={busyId === `${d.id}-isActive`}
                      onChange={(v) => patch(d.id, { isActive: v })}
                      label="تغییر وضعیت فعال"
                    />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/doctors/${d.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-jade-50 px-3 py-1.5 text-[11px] font-extrabold text-jade-700 transition-colors hover:bg-jade-600 hover:text-cream"
                  >
                    <ExternalLink className="size-3.5" />
                    مشاهده
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
