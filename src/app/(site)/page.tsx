import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headset,
  HeartPulse,
  Quote,
  SearchCheck,
  ShieldCheck,
  Star,
  Stethoscope,
  UserRoundCheck,
  Video,
  Zap,
} from "lucide-react";
import { DoctorColCard } from "@/components/doctor-card";
import { FaqAccordion } from "@/components/faq-accordion";
import { HeroSearch } from "@/components/hero-search";
import { SpecialtyIcon, tintOf } from "@/components/specialty-icon";
import { getCities, getFeaturedDoctors, getSpecialtiesWithCounts } from "@/lib/queries";
import { getSiteSettings } from "@/lib/site-settings";
import { cn, formatFaNumber, toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: SearchCheck,
    title: "جستجو کنید",
    desc: "بر اساس تخصص، شهر یا نام پزشک، از میان هزاران پزشک تاییدشده انتخاب کنید.",
  },
  {
    icon: CalendarCheck2,
    title: "نوبت رزرو کنید",
    desc: "تقویم آنلاین پزشک را ببینید و ساعت دلخواهتان را در چند ثانیه رزرو کنید.",
  },
  {
    icon: UserRoundCheck,
    title: "ویزیت و پیگیری",
    desc: "با کد پیگیری، نوبت را مدیریت کنید و یادآوری پیامک دریافت کنید.",
  },
];

const WHY_US = [
  { icon: BadgeCheck, title: "پزشکان تاییدشده", desc: "تمامی پزشکان عضو نظام پزشکی با مدارک بررسی‌شده هستند." },
  { icon: Zap, title: "رزرو در ۳۰ ثانیه", desc: "بدون تماس تلفنی؛ تقویم واقعی پزشک، رزرو آنی." },
  { icon: CreditCard, title: "بدون کارمزد", desc: "رزرو نوبت کاملاً رایگان است؛ فقط هزینه ویزیت پزشک." },
  { icon: Headset, title: "پشتیبانی ۲۴/۷", desc: "تیم پشتیبانی نوبت سلامت در هر ساعت پاسخگوی شماست." },
];

const TESTIMONIALS = [
  {
    name: "سارا مرادی",
    city: "تهران",
    text: "نزدیک به حاملگی دوم بودم و نمی‌توانستم ساعت‌ها توی مطب منتظر بمانم. با نوبت سلامت دقیقاً سر ساعت در مطب بودم. سه‌بار است که ازش استفاده می‌کنم.",
  },
  {
    name: "محمدرضا کاظمی",
    city: "اصفهان",
    text: "مشاوره آنلاین روانپزشکی گرفتم؛ کيفیت تماس عالی بود و حس کردم کنار خانواده‌ام جلسه داشتم. ایده‌آل برای شهرهایی مثل ما.",
  },
  {
    name: "نگار احمدی",
    city: "مشهد",
    text: "کد پیگیری و یادآوری پیامکی واقعاً دقیق کار می‌کند. دیگر هیچ‌وقت نوبت پوستم را فراموش نمی‌کنم. تجربه‌ای که توقعش را نداشتم.",
  },
];

const FAQS = [
  {
    q: "رزرو نوبت در نوبت سلامت چطور انجام می‌شود؟",
    a: "کافیست تخصص یا نام پزشک و شهر خود را جستجو کنید، از تقویم آنلاین پزشک زمان مناسب را انتخاب و اطلاعات تماس خود را وارد کنید. بلافاصله کد پیگیری نوبت برایتان صادر می‌شود.",
  },
  {
    q: "آیا رزرو نوبت هزینه‌ای دارد؟",
    a: "خیر. ثبت و رزرو نوبت در نوبت سلامت کاملاً رایگان است و هیچ کارمزدی دریافت نمی‌شود؛ شما فقط هزینه ویزیت پزشک را پرداخت می‌کنید.",
  },
  {
    q: "مشاوره آنلاین چگونه برگزار می‌شود؟",
    a: "پس از رزرو «مشاوره آنلاین»، لینک جلسه تصویری یا تماس تلفنی قبل از شروع نوبت برایتان پیامک می‌شود. هیچ برنامه‌ای لازم نیست نصب کنید.",
  },
  {
    q: "چطور نوبت خود را لغو یا جابه‌جا کنم؟",
    a: "از بخش «پیگیری نوبت» با وارد کردن کد پیگیری و شماره موبایل، می‌توانید نوبت را لغو یا به زمان دیگری منتقل کنید؛ تا ۲۴ ساعت قبل از نوبت بدون هزینه.",
  },
  {
    q: "آیا پزشکان سایت تایید شده‌اند؟",
    a: "بله. کد عضویت نظام پزشکی تمامی پزشکان پیش از انتشار پروفایل بررسی و تایید می‌شود و امتیازها بر اساس نظرات واقعی بیماران ویزیت‌شده ثبت می‌گردد.",
  },
];

export default async function HomePage() {
  const [specialties, cityRows, featured, settings] = await Promise.all([
    getSpecialtiesWithCounts(),
    getCities(),
    getFeaturedDoctors(8),
    getSiteSettings(),
  ]);

  const bentoSpans = [
    "lg:col-span-2", // قلب
    "",
    "",
    "",
    "",
    "lg:col-span-2", // دندان
    "",
    "",
    "",
    "",
    "lg:col-span-2", // داخلی
    "",
  ];

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="dot-grid pointer-events-none absolute -top-10 end-0 h-72 w-72 opacity-60" />
        <div className="pointer-events-none absolute -end-32 top-40 size-[420px] rounded-full bg-jade-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -start-40 bottom-0 size-[380px] rounded-full bg-sun-100/80 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8 lg:pt-16 lg:pb-24">
          {/* Copy */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-jade-200 bg-jade-50 px-4 py-1.5 text-xs font-extrabold text-jade-700">
              <HeartPulse className="size-4 text-coral-500" />
              پلتفرم نوبت‌دهی آنلاین ایرانی
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.25] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem] lg:leading-[1.2]">
              سلامت شما، فقط
              <span className="relative mx-2 inline-block text-jade-700">
                یک نوبت
                <span className="absolute -inset-x-2 bottom-1 -z-10 h-4 -rotate-1 rounded-sm bg-sun-200 sm:h-5" />
              </span>
              فاصله دارد
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-ink-soft sm:text-lg sm:leading-9">
              در کمتر از ۳۰ ثانیه، از میان
              <span className="mx-1 font-black text-jade-800">{settings.statsDoctors}+</span>
              پزشک متخصص و فوق‌تخصص در سراسر ایران نوبت بگیرید — حضوری یا آنلاین، بدون معطلی و بدون کارمزد.
            </p>

            <div className="mt-10 lg:mt-14">
              <HeroSearch
                specialties={specialties.map((s) => ({ slug: s.slug, name: s.name }))}
                cities={cityRows.map((c) => c.name)}
              />
            </div>

            {/* Quick searches */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
              <span className="font-bold">پرتکرار:</span>
              {[
                { label: "متخصص زنان", href: "/doctors?specialty=zanan" },
                { label: "قلب و عروق", href: "/doctors?specialty=ghalb" },
                { label: "روانپزشک آنلاین", href: "/doctors?specialty=ravanpezeshk&type=online" },
                { label: "دندانپزشکی", href: "/doctors?specialty=dandan" },
              ].map((x) => (
                <Link
                  key={x.label}
                  href={x.href}
                  className="rounded-full border border-line bg-cream px-3 py-1.5 font-bold text-ink-soft transition-colors hover:border-jade-400 hover:text-jade-700"
                >
                  {x.label}
                </Link>
              ))}
            </div>

            {/* Trust */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 space-x-reverse" dir="ltr">
                  {["ن", "م", "س", "ا"].map((ch, i) => (
                    <span
                      key={i}
                      className={cn(
                        "grid size-9 place-items-center rounded-full border-2 border-paper text-xs font-black",
                        ["bg-jade-600 text-cream", "bg-coral-400 text-cream", "bg-sun-300 text-ink", "bg-jade-200 text-jade-900"][i]
                      )}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <div className="text-xs leading-5">
                  <p className="font-black text-ink">{settings.statsAppointments}+ نوبت موفق</p>
                  <p className="text-ink-faint">توسط بیماران رزرو شده</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex" dir="ltr">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-sun-500 text-sun-500" strokeWidth={0} />
                  ))}
                </span>
                <div className="text-xs leading-5">
                  <p className="font-black text-ink">{toFa(4.8)} از ۵</p>
                  <p className="text-ink-faint">رضایت بیماران</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mt-14 lg:col-span-5 lg:mt-0">
            <div className="pointer-events-none absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-[2.5rem] border-2 border-dashed border-jade-300/70" />
            <div className="relative overflow-hidden rounded-[2.5rem] bg-sand shadow-pop">
              <Image
                src="/images/hero-doctor.jpg"
                alt="پزشک نوبت سلامت"
                width={800}
                height={1000}
                priority
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-jade-950/85 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-cream">دکتر سارا محمدی</p>
                    <p className="mt-0.5 text-xs text-jade-200">متخصص زنان و زایمان — تهران</p>
                  </div>
                  <Link
                    href="/doctors/dr-sara-mohammadi#booking"
                    className="shrink-0 rounded-xl bg-coral-500 px-4 py-2 text-xs font-extrabold text-cream transition-colors hover:bg-coral-600"
                  >
                    دریافت نوبت
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -start-4 top-8 animate-floaty rounded-2xl border border-line bg-cream/95 p-4 shadow-lift backdrop-blur sm:-start-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-jade-100">
                  <CheckCircle2 className="size-5 text-jade-700" />
                </span>
                <div className="text-xs leading-5">
                  <p className="font-black text-ink">نوبت رزرو شد</p>
                  <p className="text-ink-faint">شنبه — ساعت {toFa("10:30")}</p>
                </div>
              </div>
            </div>

            <div className="absolute -end-2 bottom-24 animate-floaty-slow rounded-2xl border border-line bg-cream/95 p-4 shadow-lift backdrop-blur sm:-end-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-sun-100">
                  <Stethoscope className="size-5 text-sun-600" />
                </span>
                <div className="text-xs leading-5">
                  <p className="font-black text-ink">{settings.statsDoctors}+ پزشک</p>
                  <p className="text-ink-faint">در {settings.statsSpecialties} تخصص فعال</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BAND ================= */}
      <section className="relative overflow-hidden bg-jade-950 py-10">
        <div className="line-strip pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { value: settings.statsDoctors, suffix: "+", label: "پزشک متخصص و فوق تخصص" },
            { value: settings.statsSpecialties, suffix: "", label: "تخصص و فوق تخصص پزشکی" },
            { value: settings.statsAppointments, suffix: "+", label: "نوبت موفق رزرو شده" },
            { value: settings.statsSatisfaction, suffix: "٪", label: "رضایت از تجربه رزرو" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-cream sm:text-4xl">
                {s.value}
                <span className="text-coral-400">{s.suffix}</span>
              </p>
              <p className="mt-2 text-xs font-bold text-jade-200/80 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SPECIALTIES ================= */}
      <section id="specialties" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black tracking-widest text-coral-500">تخصص‌های پزشکی</span>
            <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">در کدام حوزه پزشک می‌خواهید؟</h2>
          </div>
          <Link
            href="/doctors"
            className="group inline-flex items-center gap-2 text-sm font-extrabold text-jade-700 transition-colors hover:text-coral-600"
          >
            مشاهده همه پزشکان
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        <div className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {specialties.map((s, i) => {
            const t = tintOf(s.tint);
            return (
              <Link
                key={s.slug}
                href={`/doctors?specialty=${s.slug}`}
                className={cn(
                  "group animate-fade-up rounded-3xl border border-line bg-cream p-5 transition-all duration-300 hover:-translate-y-1 hover:border-jade-300 hover:shadow-lift",
                  t.hoverBg,
                  bentoSpans[i % bentoSpans.length]
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <SpecialtyIcon icon={s.icon} tint={s.tint} className="size-14 sm:size-16" />
                  <span className="grid size-8 place-items-center rounded-full border border-line text-ink-faint opacity-0 transition-all duration-300 group-hover:border-jade-600 group-hover:bg-jade-700 group-hover:text-cream group-hover:opacity-100">
                    <ArrowLeft className="size-4" />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-black text-ink">{s.name}</h3>
                {s.blurb && <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-ink-faint">{s.blurb}</p>}
                <p className="mt-3 text-xs font-extrabold text-jade-700">{formatFaNumber(s.doctorCount)} پزشک فعال</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-line bg-sand/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <span className="text-xs font-black tracking-widest text-coral-500">مسیر ساده رزرو</span>
            <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">نوبت‌گیری در سه قدم</h2>
          </div>

          <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            <div className="pointer-events-none absolute inset-x-24 top-12 hidden border-t-2 border-dashed border-jade-300/70 md:block" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="relative mx-auto grid size-24 place-items-center rounded-[1.75rem] border border-line bg-cream shadow-soft">
                  <step.icon className="size-10 text-jade-700" strokeWidth={1.7} />
                  <span className="absolute -end-2 -top-2 grid size-8 place-items-center rounded-full bg-coral-500 text-sm font-black text-cream shadow-soft">
                    {toFa(i + 1)}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-black text-ink">{step.title}</h3>
                <p className="mx-auto mt-2.5 max-w-xs text-sm leading-7 text-ink-soft">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED DOCTORS ================= */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black tracking-widest text-coral-500">برترین‌های این هفته</span>
              <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">پزشکان پربازدید</h2>
            </div>
            <Link
              href="/doctors?sort=rating"
              className="group inline-flex items-center gap-2 text-sm font-extrabold text-jade-700 transition-colors hover:text-coral-600"
            >
              مشاهده همه
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
          {featured.map((d, i) => (
            <DoctorColCard key={d.id} doctor={d} index={i} />
          ))}
          <Link
            href="/doctors"
            className="grid w-[140px] shrink-0 snap-start place-items-center rounded-3xl border-2 border-dashed border-jade-300 text-center text-sm font-extrabold text-jade-700 transition-colors hover:border-coral-400 hover:text-coral-600"
          >
            <span>
              مشاهده
              <br />
              {settings.statsDoctors}+ پزشک
              <ArrowLeft className="mx-auto mt-3 size-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* ================= ONLINE CONSULT ================= */}
      <section className="relative overflow-hidden bg-jade-950 py-20">
        <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -start-40 -top-40 size-[500px] rounded-full bg-jade-800/50 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-jade-700 bg-jade-900 px-4 py-1.5 text-xs font-extrabold text-jade-200">
              <Video className="size-4 text-coral-400" />
              مشاوره آنلاین
            </span>
            <h2 className="mt-6 text-3xl font-black leading-[1.3] text-cream sm:text-4xl">
              پزشک شما،
              <br />
              در اتاق نشیمن‌تان
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-8 text-jade-200/85 sm:text-base">
              بدون رفت‌وآمد و معطلی، با پزشکان برگزیده گفتگوی تصویری یا تلفنی داشته باشید. نسخه
              الکترونیک و جواب آزمایش‌تان نیز در همان جلسه بررسی می‌شود.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "بدون نیاز به نصب برنامه، مستقیم در مرورگر",
                "شروع دقیق سر ساعت، با یادآوری پیامکی",
                "نسخه الکترونیک معتبر و قابل استعلام",
                "مناسب معاینات مجدد و مشاوره‌های روان",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-bold text-jade-100">
                  <CheckCircle2 className="size-5 shrink-0 text-coral-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/doctors?type=online"
              className="mt-9 inline-flex items-center gap-2.5 rounded-2xl bg-coral-500 px-7 py-3.5 text-sm font-black text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600"
            >
              <Video className="size-4.5" />
              مشاهده پزشکان آنلاین
            </Link>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-0 translate-x-5 translate-y-5 rounded-[2.5rem] border-2 border-dashed border-jade-600/60" />
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-pop">
              <Image
                src="/images/online-consult.jpg"
                alt="مشاوره آنلاین با پزشک"
                width={900}
                height={650}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-cream/92 px-3.5 py-2 text-xs font-extrabold text-ink shadow-soft backdrop-blur">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-coral-500" />
                </span>
                جلسه زنده — دکتر قاسمی
              </div>
              <div className="absolute bottom-4 end-4 inline-flex items-center gap-2.5 rounded-2xl bg-jade-950/90 px-4 py-3 text-cream shadow-soft backdrop-blur">
                <Clock3 className="size-5 text-sun-300" />
                <div className="text-xs leading-5">
                  <p className="font-black">{toFa("24:18")}</p>
                  <p className="text-jade-200/70">مدت جلسه</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY US ================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <span className="text-xs font-black tracking-widest text-coral-500">چرا نوبت سلامت؟</span>
          <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">تجربه‌ای که بیماران دوست دارند</h2>
        </div>
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((f) => (
            <div
              key={f.title}
              className="animate-fade-up rounded-3xl border border-line bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:border-jade-300 hover:shadow-lift"
            >
              <span className="grid size-13 place-items-center rounded-2xl bg-jade-50">
                <f.icon className="size-6.5 text-jade-700" strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-base font-black text-ink">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-6.5 text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="border-y border-line bg-sand/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <span className="text-xs font-black tracking-widest text-coral-500">بیماران ما</span>
            <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">تجربه واقعی کاربران</h2>
          </div>
          <div className="stagger grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="animate-fade-up flex flex-col rounded-3xl border border-line bg-cream p-6 shadow-soft"
              >
                <Quote className="size-8 text-jade-200" strokeWidth={1.5} />
                <blockquote className="mt-4 flex-1 text-sm leading-7.5 text-ink-soft">{t.text}</blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t border-dashed border-line pt-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-full bg-jade-600 text-sm font-black text-cream">
                      {t.name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-black text-ink">{t.name}</p>
                      <p className="text-xs text-ink-faint">{t.city}</p>
                    </div>
                  </div>
                  <span className="flex" dir="ltr">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-sun-500 text-sun-500" strokeWidth={0} />
                    ))}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="text-xs font-black tracking-widest text-coral-500">پاسخ سریع</span>
            <h2 className="mt-3 text-2xl font-black leading-[1.4] text-ink sm:text-3xl">
              سوالات متداول
              <br />
              بیماران
            </h2>
            <p className="mt-5 text-sm leading-8 text-ink-soft">
              پاسخ سوالتان را پیدا نکردید؟ تیم پشتیبانی نوبت سلامت هر ساعت از شبانه‌روز کنار شماست.
            </p>
            <a
              href="tel:02191304567"
              className="mt-7 inline-flex items-center gap-2.5 rounded-2xl border border-line bg-cream px-6 py-3.5 text-sm font-extrabold text-jade-800 shadow-soft transition-all hover:-translate-y-0.5 hover:border-jade-400"
            >
              <Headset className="size-5 text-coral-500" />
              تماس با پشتیبانی
            </a>
          </div>
          <div className="lg:col-span-3">
            <FaqAccordion items={FAQS} />
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-coral-500 px-6 py-14 text-center shadow-pop sm:px-12">
          <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-30" />
          <div className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full border-[22px] border-cream/10" />
          <div className="pointer-events-none absolute -bottom-24 -start-16 size-72 rounded-full border-[26px] border-cream/10" />
          <div className="relative mx-auto max-w-2xl">
            <ShieldCheck className="mx-auto size-12 text-cream" strokeWidth={1.6} />
            <h2 className="mt-6 text-3xl font-black leading-[1.35] text-cream sm:text-4xl">
              همین حالا نوبت‌تان را
              <br />
              رزرو کنید
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-cream/90 sm:text-base">
              بیش از {settings.statsDoctors} پزشک متخصص آماده پذیرش شما هستند؛ بدون معطلی، بدون کارمزد.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/doctors"
                className="w-full rounded-2xl bg-jade-950 px-8 py-4 text-sm font-black text-cream transition-all hover:-translate-y-0.5 hover:bg-jade-900 sm:w-auto"
              >
                یافتن پزشک
              </Link>
              <Link
                href="/doctors?type=online"
                className="w-full rounded-2xl border-2 border-cream/70 px-8 py-4 text-sm font-black text-cream transition-all hover:-translate-y-0.5 hover:bg-cream/10 sm:w-auto"
              >
                مشاوره آنلاین
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
