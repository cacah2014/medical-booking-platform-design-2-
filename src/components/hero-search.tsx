"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, ChevronDown, MapPin, Search, Stethoscope, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSearch({
  specialties,
  cities,
}: {
  specialties: { slug: string; name: string }[];
  cities: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<"inperson" | "online">("inperson");

  const submit = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (specialty) params.set("specialty", specialty);
    if (city) params.set("city", city);
    if (type === "online") params.set("type", "online");
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* Tabs */}
      <div className="absolute -top-11 start-2 flex gap-1">
        {(
          [
            { key: "inperson", label: "ویزیت حضوری", icon: Building2 },
            { key: "online", label: "مشاوره آنلاین", icon: Video },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-t-2xl px-5 py-3 text-[13px] font-extrabold transition-all",
              type === key ? "bg-cream text-jade-800" : "bg-cream/40 text-ink-soft/70 hover:bg-cream/70"
            )}
          >
            <Icon className={cn("size-4", type === key && key === "online" ? "text-coral-500" : type === key ? "text-jade-600" : "")} />
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="rounded-3xl rounded-ss-none border border-line bg-cream p-3 shadow-lift sm:rounded-ss-none"
      >
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.25fr_1fr_1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="نام پزشک یا عنوان تخصصی…"
              className="field !rounded-2xl ps-11"
            />
          </label>

          <label className="relative">
            <Stethoscope className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="field appearance-none !rounded-2xl ps-11 pe-9"
            >
              <option value="">انتخاب تخصص</option>
              {specialties.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          </label>

          <label className="relative">
            <MapPin className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="field appearance-none !rounded-2xl ps-11 pe-9"
            >
              <option value="">همه شهرها</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3.5 size-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          </label>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-coral-500 px-8 py-3 text-sm font-black text-cream shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-coral-600 active:translate-y-0"
          >
            <Search className="size-4.5" />
            جستجو
          </button>
        </div>
      </form>
    </div>
  );
}
