import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  MapPin,
  Star,
  Video,
} from "lucide-react";
import { DoctorAvatar } from "@/components/doctor-avatar";
import type { DoctorCardData } from "@/lib/queries";
import { cn, formatFaNumber, formatToman, toFa } from "@/lib/utils";

function RatingChip({ rating, reviewsCount }: { rating: string; reviewsCount: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-100 px-2.5 py-1 text-xs font-extrabold text-sun-600">
      <Star className="size-3.5 fill-sun-500 text-sun-500" strokeWidth={0} />
      {toFa(Number(rating).toFixed(1))}
      <span className="font-medium text-sun-600/70">({formatFaNumber(reviewsCount)} نظر)</span>
    </span>
  );
}

/* ---------- Row card — listing page ---------- */
export function DoctorRowCard({ doctor, index = 0 }: { doctor: DoctorCardData; index?: number }) {
  const href = `/doctors/${doctor.slug}`;
  return (
    <article
      className="group animate-fade-up rounded-3xl border border-line bg-cream p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-jade-300 hover:shadow-lift sm:p-5"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <Link href={href} className="relative mx-auto w-full max-w-[220px] shrink-0 sm:mx-0 sm:w-36">
          <DoctorAvatar
            image={doctor.image}
            name={doctor.fullName}
            className="aspect-[4/5] w-full rounded-2xl object-cover sm:w-36"
            textClassName="text-4xl"
          />
          {doctor.onlineConsult && (
            <span className="absolute -bottom-2 start-2 inline-flex items-center gap-1 rounded-full bg-jade-700 px-2.5 py-1 text-[10px] font-extrabold text-cream shadow-soft">
              <Video className="size-3" />
              مشاوره آنلاین
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={href} className="text-lg font-black text-ink transition-colors hover:text-jade-700">
              {doctor.fullName}
            </Link>
            {doctor.isVerified && <BadgeCheck className="size-5 fill-jade-600 text-cream" strokeWidth={1.8} />}
          </div>
          <p className="mt-1 text-sm font-bold text-jade-700">{doctor.title}</p>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
            <MapPin className="size-4 shrink-0 text-coral-500" />
            <span className="truncate">
              {doctor.city.name} — {doctor.clinicAddress}
            </span>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <RatingChip rating={doctor.rating} reviewsCount={doctor.reviewsCount} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-jade-50 px-2.5 py-1 text-xs font-bold text-jade-700">
              <Briefcase className="size-3.5" />
              {toFa(doctor.experienceYears)} سال تجربه
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-3 border-t border-line pt-4 sm:w-52 sm:flex-col sm:items-stretch sm:justify-center sm:border-t-0 sm:border-s sm:pt-0 sm:ps-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-50 px-3 py-1.5 text-xs font-extrabold text-coral-600">
              <CalendarDays className="size-4" />
              اولین نوبت: {doctor.firstSlotLabel}
            </span>
            <p className="mt-2.5 hidden text-sm sm:block">
              <span className="text-xs text-ink-faint">ویزیت حضوری: </span>
              <span className="font-black text-ink">{formatToman(doctor.consultPrice)}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`${href}#booking`}
              className="rounded-xl bg-coral-500 px-5 py-2.5 text-center text-sm font-extrabold text-cream shadow-soft transition-all hover:bg-coral-600"
            >
              دریافت نوبت
            </Link>
            <Link
              href={href}
              className="rounded-xl border border-line px-5 py-2.5 text-center text-sm font-bold text-ink-soft transition-colors hover:border-jade-400 hover:text-jade-700"
            >
              مشاهده پروفایل
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Column card — home page carousel ---------- */
export function DoctorColCard({
  doctor,
  index = 0,
  className,
}: {
  doctor: DoctorCardData;
  index?: number;
  className?: string;
}) {
  const href = `/doctors/${doctor.slug}`;
  return (
    <article
      className={cn(
        "group animate-fade-up relative w-[286px] shrink-0 snap-start rounded-3xl border border-line bg-cream p-4 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:w-[300px]",
        className
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <Link href={href} className="relative block overflow-hidden rounded-2xl">
        <DoctorAvatar
          image={doctor.image}
          name={doctor.fullName}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          textClassName="text-5xl"
        />
        <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-cream/95 px-2.5 py-1 text-xs font-extrabold text-ink shadow-soft backdrop-blur">
          <Star className="size-3.5 fill-sun-500 text-sun-500" strokeWidth={0} />
          {toFa(Number(doctor.rating).toFixed(1))}
        </span>
        {doctor.onlineConsult && (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-jade-700/95 px-2.5 py-1 text-[10px] font-extrabold text-cream backdrop-blur">
            <Video className="size-3" />
            آنلاین
          </span>
        )}
      </Link>

      <div className="px-1 pt-4">
        <div className="flex items-center gap-1.5">
          <Link href={href} className="truncate text-base font-black text-ink transition-colors hover:text-jade-700">
            {doctor.fullName}
          </Link>
          {doctor.isVerified && <BadgeCheck className="size-4.5 shrink-0 fill-jade-600 text-cream" strokeWidth={1.8} />}
        </div>
        <p className="mt-1 truncate text-xs font-bold text-jade-700">
          {doctor.title}
          <span className="mx-1.5 text-line">|</span>
          <span className="font-medium text-ink-soft">{doctor.city.name}</span>
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-3.5 text-xs">
          <span className="inline-flex items-center gap-1 font-bold text-coral-600">
            <CalendarDays className="size-4" />
            {doctor.firstSlotLabel}
          </span>
          <span className="font-black text-ink">{formatToman(doctor.consultPrice)}</span>
        </div>

        <Link
          href={`${href}#booking`}
          className="mt-4 block rounded-xl bg-jade-700 py-2.5 text-center text-sm font-extrabold text-cream transition-all duration-300 group-hover:bg-coral-500"
        >
          دریافت نوبت
        </Link>
      </div>
    </article>
  );
}
