"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { RatingStars } from "@/components/rating-stars";
import type { AdminReview } from "@/lib/admin-queries";
import { cn, formatFaDate } from "@/lib/utils";

export function ReviewsTable({ items }: { items: AdminReview[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(id: number, isPublished: boolean) {
    setBusyId(`${id}-toggle`);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublished }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (!confirm("این نظر برای همیشه حذف شود؟ امتیاز پزشک نیز بازمحاسبه می‌شود.")) return;
    setBusyId(`${id}-del`);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-cream px-6 py-16 text-center">
        <p className="text-sm font-bold text-ink-faint">هنوز نظری ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <article
          key={r.id}
          className={cn(
            "rounded-2xl border bg-cream p-5 shadow-soft transition-opacity",
            r.isPublished ? "border-line" : "border-coral-200 opacity-70"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-jade-600 text-xs font-black text-cream">
                {r.authorName[0]}
              </span>
              <div>
                <p className="text-sm font-black text-ink">{r.authorName}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">
                  برای{" "}
                  <Link href={`/doctors/${r.doctorSlug}`} target="_blank" className="font-bold text-jade-700 hover:text-coral-600">
                    {r.doctorName}
                  </Link>
                  {" — "}
                  {r.visitType === "online" ? "مشاوره آنلاین" : "ویزیت حضوری"}
                  {" — "}
                  {formatFaDate(r.createdAt.toISOString().slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RatingStars rating={r.rating} starClass="size-3.5" />
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-extrabold",
                  r.isPublished ? "bg-jade-50 text-jade-700" : "bg-coral-50 text-coral-600"
                )}
              >
                {r.isPublished ? "منتشرشده" : "پنهان"}
              </span>
            </div>
          </div>

          <p className="mt-3.5 text-sm leading-7 text-ink-soft">{r.comment}</p>

          <div className="mt-4 flex items-center gap-2 border-t border-dashed border-line pt-4">
            <button
              onClick={() => toggle(r.id, !r.isPublished)}
              disabled={busyId === `${r.id}-toggle`}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-extrabold transition-colors",
                r.isPublished
                  ? "bg-sand text-ink-soft hover:bg-line"
                  : "bg-jade-50 text-jade-700 hover:bg-jade-600 hover:text-cream"
              )}
            >
              {busyId === `${r.id}-toggle` ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : r.isPublished ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
              {r.isPublished ? "پنهان کردن" : "انتشار"}
            </button>
            <button
              onClick={() => remove(r.id)}
              disabled={busyId === `${r.id}-del`}
              className="flex items-center gap-1.5 rounded-lg bg-coral-50 px-3.5 py-2 text-[11px] font-extrabold text-coral-600 transition-colors hover:bg-coral-500 hover:text-cream"
            >
              {busyId === `${r.id}-del` ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              حذف دائم
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
