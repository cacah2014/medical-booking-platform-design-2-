import Link from "next/link";
import {
  AtSign,
  CalendarHeart,
  Camera,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site-settings";

const QUICK_LINKS = [
  { href: "/doctors", label: "یافتن پزشک" },
  { href: "/doctors?type=online", label: "مشاوره آنلاین" },
  { href: "/track", label: "پیگیری نوبت" },
  { href: "/#specialties", label: "تخصص‌های پزشکی" },
  { href: "/#faq", label: "سوالات متداول" },
];

const TOP_SPECIALTIES = [
  { href: "/doctors?specialty=zanan", label: "متخصص زنان و زایمان" },
  { href: "/doctors?specialty=ghalb", label: "متخصص قلب و عروق" },
  { href: "/doctors?specialty=poost", label: "متخصص پوست و مو" },
  { href: "/doctors?specialty=atfal", label: "متخصص اطفال" },
  { href: "/doctors?specialty=ravanpezeshk", label: "روانپزشک" },
  { href: "/doctors?specialty=dandan", label: "دندانپزشک" },
];

const CITIES = [
  { href: "/doctors?city=" + encodeURIComponent("تهران"), label: "پزشکان تهران" },
  { href: "/doctors?city=" + encodeURIComponent("مشهد"), label: "پزشکان مشهد" },
  { href: "/doctors?city=" + encodeURIComponent("اصفهان"), label: "پزشکان اصفهان" },
  { href: "/doctors?city=" + encodeURIComponent("شیراز"), label: "پزشکان شیراز" },
  { href: "/doctors?city=" + encodeURIComponent("تبریز"), label: "پزشکان تبریز" },
];

export function SiteFooter({ settings = DEFAULT_SETTINGS }: { settings?: SiteSettings }) {
  return (
    <footer className="relative mt-24 overflow-hidden bg-jade-950 text-jade-100">
      <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        {/* Top band */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-12 lg:flex-row lg:items-center">
          <div className="max-w-md">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-coral-500 text-cream">
                <CalendarHeart className="size-6" strokeWidth={2.2} />
              </span>
              <span>
                <span className="block text-2xl font-black text-cream">نوبت سلامت</span>
                <span className="text-xs font-semibold tracking-[0.3em] text-jade-300 uppercase">
                  Nobatesalamat.ir
                </span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-jade-200/80">
              نوبت سلامت پلتفرم نوبت‌دهی آنلاین ایرانی است؛ پل ارتباطی میان بیماران و بهترین پزشکان
              متخصص کشور. نوبت خود را در چند ثانیه رزرو کنید — بدون معطلی، بدون کارمزد.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Camera, label: "اینستاگرام" },
                { icon: Send, label: "تلگرام" },
                { icon: AtSign, label: "آپارات" },
                { icon: Globe, label: "وبلاگ" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-white/15 text-jade-200 transition-all hover:border-coral-400 hover:bg-coral-500 hover:text-cream"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <ShieldCheck className="size-8 text-sun-300" strokeWidth={1.6} />
              <div className="text-xs leading-5">
                <p className="font-extrabold text-cream">پزشکان تاییدشده</p>
                <p className="text-jade-200/70">عضو نظام پزشکی</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <Stethoscope className="size-8 text-sun-300" strokeWidth={1.6} />
              <div className="text-xs leading-5">
                <p className="font-extrabold text-cream">{settings.statsDoctors}+ پزشک</p>
                <p className="text-jade-200/70">در {settings.statsSpecialties} تخصص</p>
              </div>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-4">
          <nav>
            <h3 className="mb-4 text-sm font-black text-cream">دسترسی سریع</h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-jade-200/75 transition-colors hover:text-sun-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav>
            <h3 className="mb-4 text-sm font-black text-cream">تخصص‌های پرطرفدار</h3>
            <ul className="space-y-2.5">
              {TOP_SPECIALTIES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-jade-200/75 transition-colors hover:text-sun-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav>
            <h3 className="mb-4 text-sm font-black text-cream">شهرهای پرجستجو</h3>
            <ul className="space-y-2.5">
              {CITIES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-jade-200/75 transition-colors hover:text-sun-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="mb-4 text-sm font-black text-cream">ارتباط با ما</h3>
            <ul className="space-y-3.5 text-sm text-jade-200/75">
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-coral-400" />
                <a href={`tel:${settings.phoneLink}`} className="transition-colors hover:text-sun-300" dir="ltr">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-coral-400" />
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-sun-300" dir="ltr">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-coral-400" />
                {settings.address}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-jade-200/60 sm:flex-row">
          <p>© ۱۴۰۴ نوبت سلامت — تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-sun-300">قوانین و مقررات</Link>
            <Link href="#" className="transition-colors hover:text-sun-300">حریم خصوصی</Link>
            <Link href="/admin/login" className="transition-colors hover:text-sun-300">ورود مدیران</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
