import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { getAdminAppointments } from "@/lib/admin-queries";
import { AppointmentsTable } from "@/components/admin/appointments-table";
import { cn, formatFaNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مدیریت نوبت‌ها",
  robots: { index: false, follow: false },
};

const STATUS_TABS = [
  { value: "", label: "همه" },
  { value: "confirmed", label: "تاییدشده" },
  { value: "completed", label: "انجام‌شده" },
  { value: "cancelled", label: "لغوشده" },
];

type SP = Record<string, string | string[] | undefined>;

async function Content({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const items = await getAdminAppointments({ status: status || undefined, q: q || undefined });

  const tabHref = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    const s = params.toString();
    return `/admin/appointments${s ? `?${s}` : ""}`;
  };

  return (
    <>
      {/* Tabs + search */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1.5 rounded-2xl border border-line bg-cream p-1.5 shadow-soft">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tabHref(tab.value)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-extrabold transition-all",
                status === tab.value ? "bg-jade-700 text-cream shadow-soft" : "text-ink-soft hover:bg-paper"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form action="/admin/appointments" className="relative">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            name="q"
            defaultValue={q}
            placeholder="جستجو: کد پیگیری، بیمار یا پزشک…"
            className="field w-full !rounded-2xl !py-2.5 ps-10 sm:w-80"
          />
        </form>
      </div>

      <p className="mb-4 text-xs font-bold text-ink-faint">{formatFaNumber(items.length)} نوبت یافت شد</p>
      <AppointmentsTable items={items} />
    </>
  );
}

export default function AdminAppointmentsPage({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">مدیریت نوبت‌ها</h1>
        <p className="mt-1 text-sm text-ink-soft">تایید، تکمیل یا لغو نوبت‌های ثبت‌شده توسط بیماران</p>
      </div>
      <Suspense>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
