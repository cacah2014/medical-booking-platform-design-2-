import Link from "next/link";
import type { Metadata } from "next";
import { CalendarX, ChevronLeft, SearchX } from "lucide-react";
import { DoctorRowCard } from "@/components/doctor-card";
import { DoctorsFilter, SortSelect } from "@/components/doctors-filter";
import { getCities, getSpecialtiesWithCounts, searchDoctors, type DoctorFilters } from "@/lib/queries";
import { formatFaNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "یافتن پزشک — نوبت‌دهی آنلاین",
  description: "جستجو و رزرو نوبت از میان هزاران پزشک متخصص در سراسر ایران؛ حضوری و آنلاین.",
};

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export default async function DoctorsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const filters: DoctorFilters = {
    q: first(sp.q),
    specialty: first(sp.specialty),
    city: first(sp.city),
    gender: first(sp.gender),
    type: first(sp.type),
    availableToday: first(sp.today) === "1",
    sort: first(sp.sort),
  };

  const [results, specialties, cities] = await Promise.all([
    searchDoctors(filters),
    getSpecialtiesWithCounts(),
    getCities(),
  ]);

  const activeSpecialty = specialties.find((s) => s.slug === filters.specialty);
  const title = activeSpecialty ? `پزشکان ${activeSpecialty.name}` : "یافتن پزشک";

  const chips = [
    activeSpecialty && { key: "specialty", label: activeSpecialty.name },
    filters.city && { key: "city", label: `شهر ${filters.city}` },
    filters.gender && { key: "gender", label: filters.gender === "female" ? "پزشک خانم" : "پزشک آقا" },
    filters.type === "online" && { key: "type", label: "مشاوره آنلاین" },
    filters.availableToday && { key: "today", label: "نوبت امروز" },
    filters.q && { key: "q", label: `«${filters.q}»` },
  ].filter(Boolean) as { key: string; label: string }[];

  const chipHref = (removeKey: string) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && k !== removeKey) params.set(k, v);
    }
    if (removeKey === "today") params.delete("today");
    return `/doctors?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-bold text-ink-faint">
        <Link href="/" className="transition-colors hover:text-jade-700">خانه</Link>
        <ChevronLeft className="size-3.5" />
        <span className="text-ink">{title}</span>
      </nav>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {formatFaNumber(results.length)} پزشک یافت شد — نوبت خود را آنلاین و بدون کارمزد رزرو کنید.
          </p>
        </div>
        <SortSelect current={filters.sort} />
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-ink-faint">فیلترهای فعال:</span>
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={chipHref(chip.key)}
              className="group inline-flex items-center gap-2 rounded-full bg-jade-700 px-3.5 py-1.5 text-xs font-extrabold text-cream transition-colors hover:bg-coral-500"
            >
              {chip.label}
              <span className="text-cream/70 transition-colors group-hover:text-cream">✕</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[290px_1fr] lg:gap-8">
        <DoctorsFilter
          specialties={specialties}
          cities={cities.map((c) => c.name)}
          current={{
            q: filters.q,
            specialty: filters.specialty,
            city: filters.city,
            gender: filters.gender,
            type: filters.type,
            today: filters.availableToday ? "1" : undefined,
          }}
        />

        <div>
          {results.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-line bg-cream px-6 py-20 text-center">
              <span className="grid size-20 place-items-center rounded-full bg-jade-50">
                <SearchX className="size-9 text-jade-600" strokeWidth={1.6} />
              </span>
              <h2 className="mt-6 text-lg font-black text-ink">پزشکی با این مشخصات پیدا نشد</h2>
              <p className="mt-2 max-w-sm text-sm leading-7 text-ink-soft">
                فیلترها را تغییر دهید یا شهر و تخصص دیگری را امتحان کنید؛ یا برای مشاوره سریع، با پشتیبانی تماس بگیرید.
              </p>
              <Link
                href="/doctors"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-jade-700 px-6 py-3 text-sm font-extrabold text-cream transition-colors hover:bg-jade-800"
              >
                <CalendarX className="size-4.5" />
                حذف همه فیلترها
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((d, i) => (
                <DoctorRowCard key={d.id} doctor={d} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
