"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Eraser, ListFilter, Search, SlidersHorizontal, Video, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Current {
  q?: string;
  specialty?: string;
  city?: string;
  gender?: string;
  type?: string;
  today?: string;
}

export function DoctorsFilter({
  specialties,
  cities,
  current,
}: {
  specialties: { slug: string; name: string; doctorCount: number }[];
  cities: string[];
  current: Current;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(current.q ?? "");

  useEffect(() => setQ(current.q ?? ""), [current.q]);

  const apply = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      // keep existing sort unless explicitly cleared
      router.push(`/doctors?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleClass = (active: boolean) =>
    cn(
      "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] font-bold transition-all",
      active ? "border-jade-500 bg-jade-50 text-jade-800" : "border-line bg-paper text-ink-soft hover:border-jade-300"
    );

  const form = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="mb-2.5 text-xs font-black text-ink">جستجوی نام پزشک</p>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply({ q: q.trim() || undefined });
              }
            }}
            placeholder="مثلاً دکتر محمدی…"
            className="field ps-10 !py-2.5"
          />
        </div>
      </div>

      {/* Specialty */}
      <div>
        <p className="mb-2.5 text-xs font-black text-ink">تخصص</p>
        <div className="relative">
          <select
            value={current.specialty ?? ""}
            onChange={(e) => apply({ specialty: e.target.value || undefined })}
            className="field appearance-none !py-2.5 pe-9"
          >
            <option value="">همه تخصص‌ها</option>
            {specialties.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        </div>
      </div>

      {/* City */}
      <div>
        <p className="mb-2.5 text-xs font-black text-ink">شهر</p>
        <div className="relative">
          <select
            value={current.city ?? ""}
            onChange={(e) => apply({ city: e.target.value || undefined })}
            className="field appearance-none !py-2.5 pe-9"
          >
            <option value="">همه شهرها</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="mb-2.5 text-xs font-black text-ink">جنسیت پزشک</p>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-sand/70 p-1.5">
          {[
            { value: "", label: "همه" },
            { value: "female", label: "خانم" },
            { value: "male", label: "آقا" },
          ].map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => apply({ gender: g.value || undefined })}
              className={cn(
                "rounded-xl py-2 text-xs font-extrabold transition-all",
                (current.gender ?? "") === g.value ? "bg-jade-700 text-cream shadow-soft" : "text-ink-soft hover:bg-cream"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <button type="button" onClick={() => apply({ type: current.type === "online" ? undefined : "online" })} className={cn(toggleClass(current.type === "online"), "w-full")}>
          <span className="flex items-center gap-2">
            <Video className={cn("size-4.5", current.type === "online" ? "text-jade-700" : "text-ink-faint")} />
            مشاوره آنلاین
          </span>
          <span className={cn("h-5 w-9 rounded-full p-0.5 transition-colors", current.type === "online" ? "bg-jade-600" : "bg-line")}>
            <span className={cn("block size-4 rounded-full bg-cream shadow transition-transform", current.type === "online" && "-translate-x-4")} />
          </span>
        </button>
        <button type="button" onClick={() => apply({ today: current.today === "1" ? undefined : "1" })} className={cn(toggleClass(current.today === "1"), "w-full")}>
          <span className="flex items-center gap-2">
            <Zap className={cn("size-4.5", current.today === "1" ? "text-jade-700" : "text-ink-faint")} />
            نوبت برای امروز
          </span>
          <span className={cn("h-5 w-9 rounded-full p-0.5 transition-colors", current.today === "1" ? "bg-jade-600" : "bg-line")}>
            <span className={cn("block size-4 rounded-full bg-cream shadow transition-transform", current.today === "1" && "-translate-x-4")} />
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => apply({ q: q.trim() || undefined })}
          className="flex-1 rounded-xl bg-jade-700 py-2.5 text-sm font-extrabold text-cream transition-colors hover:bg-jade-800"
        >
          اعمال فیلترها
        </button>
        <button
          type="button"
          onClick={() => router.push("/doctors")}
          className="grid size-10.5 place-items-center rounded-xl border border-line text-ink-faint transition-colors hover:border-coral-400 hover:text-coral-500"
          aria-label="حذف فیلترها"
        >
          <Eraser className="size-4.5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-4 flex w-full items-center justify-between rounded-2xl border border-line bg-cream px-4 py-3 text-sm font-extrabold text-ink shadow-soft lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4.5 text-jade-700" />
          فیلترهای جستجو
        </span>
        <ChevronDown className={cn("size-4.5 transition-transform", open && "rotate-180")} />
      </button>

      <aside
        className={cn(
          "rounded-3xl border border-line bg-cream p-5 shadow-soft lg:sticky lg:top-36 lg:block",
          open ? "mb-4 block" : "hidden"
        )}
      >
        <p className="mb-5 hidden items-center gap-2 text-sm font-black text-ink lg:flex">
          <ListFilter className="size-5 text-jade-700" />
          فیلترهای پیشرفته
        </p>
        {form}
      </aside>
    </>
  );
}

const SORTS = [
  { value: "", label: "پیشنهاد نوبت سلامت" },
  { value: "rating", label: "بالاترین امتیاز" },
  { value: "reviews", label: "بیشترین نظرات" },
  { value: "experience", label: "بیشترین سابقه" },
  { value: "price-asc", label: "کمترین هزینه ویزیت" },
  { value: "price-desc", label: "بیشترین هزینه ویزیت" },
];

export function SortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <label className="relative flex items-center gap-2 text-xs font-bold text-ink-soft">
      مرتب‌سازی:
      <select
        value={current ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set("sort", e.target.value);
          else params.delete("sort");
          router.push(`/doctors?${params.toString()}`);
        }}
        className="appearance-none rounded-xl border border-line bg-cream py-2 pe-8 ps-3 text-xs font-extrabold text-ink outline-none transition-colors focus:border-jade-400"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2.5 size-3.5 text-ink-faint" />
    </label>
  );
}
