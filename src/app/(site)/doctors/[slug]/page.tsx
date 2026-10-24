import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronLeft,
  Eye,
  GraduationCap,
  HeartPulse,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";
import { BookingWidget, type DateCard } from "@/components/booking-widget";
import { DoctorAvatar } from "@/components/doctor-avatar";
import { DoctorRowCard } from "@/components/doctor-card";
import { RatingStars } from "@/components/rating-stars";
import { ReviewForm } from "@/components/review-form";
import { getDoctorBySlug, getReviewsForDoctor, getSimilarDoctors } from "@/lib/queries";
import { upcomingDates } from "@/lib/slots";
import {
  faDayOfMonth,
  faMonthName,
  FA_WEEKDAY_TINY,
  formatFaNumber,
  formatToman,
  toFa,
  weekdayOf,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return { title: "پزشک یافت نشد" };
  return {
    title: `${doctor.fullName} — ${doctor.title}`,
    description: `نوبت‌دهی آنلاین ${doctor.fullName}، ${doctor.title} در ${doctor.city.name}. مشاهده تقویم، نظرات بیماران و رزرو نوبت.`,
  };
}

export default async function DoctorProfilePage({ params }: Props) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) notFound();

  const [reviews, similar] = await Promise.all([
    getReviewsForDoctor(doctor.id),
    getSimilarDoctors(doctor, 4),
  ]);

  const rating = Number(doctor.rating);
  const dateCards: DateCard[] = upcomingDates(doctor.workingDays ?? [], 7).map((iso) => ({
    iso,
    weekdayTiny: FA_WEEKDAY_TINY[weekdayOf(iso)],
    day: faDayOfMonth(iso),
    month: faMonthName(iso),
  }));

  const ratingBars = [
    { label: "برخورد", value: Math.min(5, rating + 0.1) },
    { label: "توضیح و راهنمایی", value: rating },
    { label: "وقت‌شناسی", value: Math.max(3.5, rating - 0.2) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-ink-faint">
        <Link href="/" className="transition-colors hover:text-jade-700">خانه</Link>
        <ChevronLeft className="size-3.5" />
        <Link href="/doctors" className="transition-colors hover:text-jade-700">پزشکان</Link>
        <ChevronLeft className="size-3.5" />
        <Link href={`/doctors?specialty=${doctor.specialty.slug}`} className="transition-colors hover:text-jade-700">
          {doctor.specialty.name}
        </Link>
        <ChevronLeft className="size-3.5" />
        <span className="text-ink">{doctor.fullName}</span>
      </nav>

      {/* Profile header */}
      <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-line bg-cream p-6 shadow-soft sm:p-8">
        <div className="dot-grid pointer-events-none absolute -end-8 -top-8 h-48 w-48 opacity-50" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <DoctorAvatar
              image={doctor.image}
              name={doctor.fullName}
              className="aspect-[4/5] w-40 rounded-3xl object-cover shadow-lift sm:w-48"
              textClassName="text-5xl"
            />
            {doctor.isVerified && (
              <span className="absolute -bottom-3 start-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-jade-700 px-3.5 py-1.5 text-[11px] font-extrabold text-cream shadow-soft rtl:translate-x-1/2">
                <ShieldCheck className="size-4" />
                تایید نظام پزشکی
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="text-2xl font-black text-ink sm:text-3xl">{doctor.fullName}</h1>
              <BadgeCheck className="size-6 fill-jade-600 text-cream" strokeWidth={1.8} />
            </div>
            <p className="mt-1.5 text-sm font-bold text-jade-700 sm:text-base">{doctor.title}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-coral-500" />
                {doctor.city.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-4 text-coral-500" />
                {toFa(doctor.experienceYears)} سال سابقه
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-4 text-coral-500" />
                {formatFaNumber(doctor.views)} بازدید
              </span>
              <span className="flex items-center gap-1.5">
                کد نظام پزشکی: <span className="font-black text-ink">{doctor.medicalCode}</span>
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-100 px-3.5 py-1.5 text-xs font-extrabold text-sun-600">
                <Star className="size-4 fill-sun-500 text-sun-500" strokeWidth={0} />
                {toFa(rating.toFixed(1))}
                <span className="font-medium text-sun-600/70">از {formatFaNumber(doctor.reviewsCount)} نظر</span>
              </span>
              {doctor.onlineConsult && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-jade-700 px-3.5 py-1.5 text-xs font-extrabold text-cream">
                  <Video className="size-4" />
                  مشاوره آنلاین فعال
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-jade-50 px-3.5 py-1.5 text-xs font-extrabold text-jade-700">
                <HeartPulse className="size-4" />
                {doctor.specialty.name}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href="#booking"
                className="rounded-xl bg-coral-500 px-6 py-3 text-sm font-extrabold text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600"
              >
                دریافت نوبت
              </a>
              {doctor.clinicPhone && (
                <a
                  href={`tel:${doctor.clinicPhone}`}
                  className="flex items-center gap-2 rounded-xl border border-line bg-cream px-6 py-3 text-sm font-extrabold text-ink transition-colors hover:border-jade-400 hover:text-jade-700"
                >
                  <Phone className="size-4" />
                  <span dir="ltr">{toFa(doctor.clinicPhone)}</span>
                </a>
              )}
            </div>
          </div>

          {/* Mini rating panel */}
          <div className="hidden w-56 shrink-0 rounded-2xl border border-line bg-paper p-5 lg:block">
            <p className="text-center text-4xl font-black text-ink">{toFa(rating.toFixed(1))}</p>
            <RatingStars rating={rating} className="mt-2 justify-center" />
            <div className="mt-4 space-y-2.5">
              {ratingBars.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-[10px] font-bold text-ink-faint">
                    <span>{b.label}</span>
                    <span>{toFa(b.value.toFixed(1))}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-jade-600" style={{ width: `${(b.value / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
        {/* Main column */}
        <div className="space-y-10">
          {/* About */}
          <section className="rounded-[2rem] border border-line bg-cream p-6 shadow-soft sm:p-8">
            <h2 className="flex items-center gap-2.5 text-lg font-black text-ink">
              <span className="grid size-9 place-items-center rounded-xl bg-jade-50">
                <Award className="size-5 text-jade-700" />
              </span>
              درباره پزشک
            </h2>
            <p className="mt-4 text-sm leading-8 text-ink-soft sm:text-[15px] sm:leading-9">{doctor.bio}</p>
            <div className="mt-6 space-y-3">
              {doctor.education && (
                <p className="flex items-start gap-3 rounded-xl bg-paper px-4 py-3 text-sm font-bold text-ink">
                  <GraduationCap className="mt-0.5 size-5 shrink-0 text-jade-700" />
                  {doctor.education}
                </p>
              )}
              {doctor.clinicAddress && (
                <p className="flex items-start gap-3 rounded-xl bg-paper px-4 py-3 text-sm font-bold text-ink">
                  <Building2 className="mt-0.5 size-5 shrink-0 text-jade-700" />
                  آدرس مطب: {doctor.city.name}، {doctor.clinicAddress}
                </p>
              )}
            </div>

            {/* Prices */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-xs font-bold text-ink-faint">ویزیت حضوری در مطب</p>
                <p className="mt-1.5 text-lg font-black text-ink">{formatToman(doctor.consultPrice)}</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-xs font-bold text-ink-faint">مشاوره آنلاین</p>
                <p className="mt-1.5 text-lg font-black text-ink">
                  {doctor.onlineConsult ? formatToman(doctor.onlinePrice) : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="rounded-[2rem] border border-line bg-cream p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2.5 text-lg font-black text-ink">
                <span className="grid size-9 place-items-center rounded-xl bg-jade-50">
                  <MessageSquareText className="size-5 text-jade-700" />
                </span>
                نظرات بیماران
              </h2>
              <span className="rounded-full bg-jade-50 px-3.5 py-1.5 text-xs font-extrabold text-jade-700">
                {formatFaNumber(doctor.reviewsCount)} نظر ثبت‌شده
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {reviews.map((r, i) => (
                <article
                  key={r.id}
                  className="animate-fade-up rounded-2xl border border-line bg-paper p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-jade-600 text-xs font-black text-cream">
                        {r.authorName[0]}
                      </span>
                      <div>
                        <p className="text-sm font-black text-ink">{r.authorName}</p>
                        <p className="text-[10px] text-ink-faint">
                          {r.visitType === "online" ? "مشاوره آنلاین" : "ویزیت حضوری"}
                        </p>
                      </div>
                    </div>
                    <RatingStars rating={r.rating} starClass="size-3.5" />
                  </div>
                  <p className="mt-3.5 text-sm leading-7.5 text-ink-soft">{r.comment}</p>
                </article>
              ))}
            </div>

            <div className="mt-6">
              <ReviewForm doctorId={doctor.id} />
            </div>
          </section>
        </div>

        {/* Booking sidebar */}
        <div id="booking" className="scroll-mt-28">
          <div className="lg:sticky lg:top-36">
            <BookingWidget
              doctorId={doctor.id}
              doctorName={doctor.fullName}
              consultPrice={doctor.consultPrice}
              onlinePrice={doctor.onlinePrice}
              onlineConsult={doctor.onlineConsult}
              clinicAddress={doctor.clinicAddress}
              cityName={doctor.city.name}
              dates={dateCards}
            />
          </div>
        </div>
      </div>

      {/* Similar doctors */}
      {similar.length > 0 && (
        <section className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-xl font-black text-ink sm:text-2xl">پزشکان مشابه {doctor.specialty.name}</h2>
            <Link
              href={`/doctors?specialty=${doctor.specialty.slug}`}
              className="text-sm font-extrabold text-jade-700 transition-colors hover:text-coral-600"
            >
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-4">
            {similar.map((d, i) => (
              <DoctorRowCard key={d.id} doctor={d} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
