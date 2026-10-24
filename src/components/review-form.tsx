"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, CircleAlert, Loader2, Send, Star, ThumbsUp, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewForm({ doctorId }: { doctorId: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [visitType, setVisitType] = useState<"inperson" | "online">("inperson");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, authorName: name, rating, comment, visitType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطایی رخ داد.");
        return;
      }
      setDone(true);
      setName("");
      setComment("");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-jade-200 bg-jade-50 p-6 text-center">
        <ThumbsUp className="mx-auto size-9 text-jade-700" />
        <p className="mt-3 text-sm font-black text-jade-900">از ثبت تجربه‌تان سپاسگزاریم!</p>
        <p className="mt-1.5 text-xs leading-6 text-jade-700">نظر شما پس از تایید نهایی در پروفایل پزشک نمایش داده می‌شود.</p>
        <button
          onClick={() => setDone(false)}
          className="mt-4 rounded-xl bg-jade-700 px-5 py-2.5 text-xs font-extrabold text-cream transition-colors hover:bg-jade-800"
        >
          ثبت نظر دیگر
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <h4 className="text-sm font-black text-ink">تجربه خود را بنویسید</h4>

      {/* Stars */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex gap-1" dir="ltr">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const active = value <= (hover || rating);
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(value)}
                aria-label={`${value} ستاره`}
                className="transition-transform hover:scale-125"
              >
                <Star
                  className={cn("size-7 transition-colors", active ? "fill-sun-500 text-sun-500" : "fill-sand text-sand")}
                  strokeWidth={0}
                />
              </button>
            );
          })}
        </div>
        <span className="text-xs font-extrabold text-ink-soft">
          {["", "خیلی بد", "بد", "متوسط", "خوب", "عالی"][hover || rating]}
        </span>
      </div>

      {/* Visit type */}
      <div className="mt-4 flex gap-2">
        {(
          [
            { key: "inperson", label: "ویزیت حضوری", icon: Building2 },
            { key: "online", label: "مشاوره آنلاین", icon: Video },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setVisitType(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
              visitType === key ? "border-jade-600 bg-jade-700 text-cream" : "border-line bg-cream text-ink-soft hover:border-jade-300"
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام شما"
          className="field bg-cream"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="تجربه‌تان از ویزیت را برای دیگر بیماران بنویسید…"
          rows={4}
          className="field resize-none bg-cream"
        />
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-coral-50 px-3.5 py-2.5 text-xs font-bold text-coral-700">
          <CircleAlert className="size-4" />
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={loading || name.trim().length < 2 || comment.trim().length < 10}
        className={cn(
          "mt-4 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold transition-all",
          loading || name.trim().length < 2 || comment.trim().length < 10
            ? "cursor-not-allowed bg-sand text-ink-faint"
            : "bg-jade-700 text-cream hover:bg-jade-800"
        )}
      >
        {loading ? <Loader2 className="size-4.5 animate-spin" /> : <Send className="size-4.5" />}
        {loading ? "در حال ارسال…" : "ثبت نظر"}
      </button>
    </div>
  );
}
