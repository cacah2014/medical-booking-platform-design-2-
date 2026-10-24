import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardCheck } from "lucide-react";
import { TrackForm } from "@/components/track-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پیگیری نوبت",
  description: "با کد پیگیری، وضعیت نوبت خود را مشاهده و مدیریت کنید.",
};

export default function TrackPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute -top-8 start-1/2 h-64 w-96 -translate-x-1/2 opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-[1.5rem] bg-jade-700 shadow-pop">
            <ClipboardCheck className="size-8 text-cream" strokeWidth={1.8} />
          </span>
          <h1 className="mt-6 text-3xl font-black text-ink">پیگیری نوبت</h1>
          <p className="mt-3 text-sm leading-7 text-ink-soft">
            کد پیگیری‌ای که هنگام رزرو دریافت کردید (مثل <span dir="ltr" className="font-black">NS-4F8K2Q</span>) را
            وارد کنید تا جزئیات و وضعیت نوبت‌تان را ببینید.
          </p>
        </div>
        <Suspense>
          <TrackForm />
        </Suspense>
      </div>
    </div>
  );
}
