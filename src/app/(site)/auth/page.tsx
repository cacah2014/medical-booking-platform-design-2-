import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CalendarHeart, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { getPatient } from "@/lib/patient-auth";
import { formatFaNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود | ثبت‌نام",
  description: "ورود یا ثبت‌نام در نوبت سلامت با شماره موبایل و کد تایید — سریع و امن.",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const patient = await getPatient();
  const sp = await searchParams;
  if (patient) {
    redirect(typeof sp.next === "string" ? sp.next : "/profile");
  }

  return (
    <section className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute -top-10 start-0 h-72 w-72 opacity-60" />
      <div className="pointer-events-none absolute -end-40 top-20 size-[420px] rounded-full bg-jade-100/70 blur-3xl" />

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20 lg:px-8">
        {/* Copy side */}
        <div className="max-lg:hidden">
          <span className="inline-flex items-center gap-2 rounded-full border border-jade-200 bg-jade-50 px-4 py-1.5 text-xs font-extrabold text-jade-700">
            <Sparkles className="size-4 text-coral-500" />
            ورود بدون رمز عبور
          </span>
          <h1 className="mt-6 text-3xl font-black leading-[1.35] text-ink xl:text-4xl xl:leading-[1.3]">
            با شماره موبایل،
            <br />
            در چند ثانیه وارد شوید
          </h1>
          <ul className="mt-8 space-y-5">
            {[
              { icon: Zap, title: "ورود و ثبت‌نام یکجا", desc: "اگر حساب ندارید، همان لحظه ساخته می‌شود — بدون فرم طولانی." },
              { icon: CalendarHeart, title: "نوبت‌های شما، یکجا", desc: "همه رزروها با کد پیگیری در پنل کاربری‌تان ذخیره می‌شود." },
              { icon: ShieldCheck, title: "امن و رمزنگاری‌شده", desc: "کد یکبارمصرف ۵ رقمی با انقضای ۲ دقیقه‌ای و سشن HttpOnly." },
            ].map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cream shadow-soft">
                  <f.icon className="size-6 text-jade-700" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="font-black text-ink">{f.title}</p>
                  <p className="mt-1 text-sm leading-7 text-ink-soft">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 border-t border-dashed border-line pt-6 text-sm text-ink-faint">
            <span className="font-black text-jade-700">{formatFaNumber(2800000)}+</span> نوبت موفق توسط کاربران نوبت سلامت رزرو شده است.
          </p>
        </div>

        {/* Form side */}
        <div className="rounded-[2rem] border border-line bg-cream p-6 shadow-lift sm:p-9">
          <div className="mb-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-jade-700 text-cream shadow-pop">
              <CalendarHeart className="size-7" strokeWidth={2.2} />
            </span>
            <h2 className="mt-4 text-xl font-black text-ink">ورود | ثبت‌نام</h2>
            <p className="mt-1.5 text-sm text-ink-soft">با شماره موبایل وارد حساب کاربری شوید</p>
          </div>
          <Suspense>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
