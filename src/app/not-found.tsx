import Link from "next/link";
import { Compass, Stethoscope } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 py-20">
      <div className="text-center">
        <div className="relative mx-auto w-fit">
          <p className="text-[7rem] font-black leading-none text-jade-100 select-none">۴۰۴</p>
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-20 place-items-center rounded-full bg-cream shadow-lift">
              <Stethoscope className="size-10 text-jade-700" />
            </span>
          </span>
        </div>
        <h1 className="mt-6 text-xl font-black text-ink">صفحه مورد نظر پیدا نشد</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-ink-soft">
          شاید آدرس را اشتباه وارد کرده‌اید؛ اما نگران نباشید، هزاران پزشک همچنان در دسترس‌اند.
        </p>
        <Link
          href="/doctors"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-jade-700 px-7 py-3.5 text-sm font-extrabold text-cream transition-colors hover:bg-jade-800"
        >
          <Compass className="size-4.5" />
          رفتن به صفحه پزشکان
        </Link>
      </div>
    </div>
  );
}
