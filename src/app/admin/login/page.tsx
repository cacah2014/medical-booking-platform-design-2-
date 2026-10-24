import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarHeart, KeyRound, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود مدیران",
  description: "ورود به پنل مدیریت نوبت سلامت",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-jade-950 px-4 py-12">
      <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -end-40 -top-40 size-[480px] rounded-full bg-jade-800/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -start-40 size-[420px] rounded-full bg-coral-600/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-13 place-items-center rounded-2xl bg-coral-500 text-cream shadow-pop">
              <CalendarHeart className="size-7" strokeWidth={2.2} />
            </span>
          </Link>
          <h1 className="mt-5 text-2xl font-black text-cream">پنل مدیریت نوبت سلامت</h1>
          <p className="mt-2 text-sm text-jade-200/80">برای ادامه، با حساب مدیر سیستم وارد شوید</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-cream p-7 shadow-pop sm:p-8">
          <AdminLoginForm />
        </div>

        {/* Demo credentials are NOT shown publicly by default.
            Only rendered when SHOW_DEMO_CREDENTIALS=1 is set (development/demo envs). */}
        {process.env.SHOW_DEMO_CREDENTIALS === "1" && (
          <div className="mt-5 rounded-2xl border border-jade-700/60 bg-jade-900/80 p-5 backdrop-blur">
            <p className="flex items-center gap-2 text-xs font-black text-sun-300">
              <KeyRound className="size-4" />
              اطلاعات ورود دمو
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/5 px-3 py-2.5">
                <p className="text-[10px] text-jade-300">نام کاربری</p>
                <p className="mt-0.5 font-black text-cream" dir="ltr">admin</p>
              </div>
              <div className="rounded-xl bg-white/5 px-3 py-2.5">
                <p className="text-[10px] text-jade-300">رمز عبور</p>
                <p className="mt-0.5 font-black text-cream" dir="ltr">Nobat@1404</p>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-jade-300/70">
          <ShieldCheck className="size-4" />
          نشست امن با کوکی HttpOnly و امضای HMAC — دسترسی فقط برای مدیران مجاز
        </p>
      </div>
    </div>
  );
}
