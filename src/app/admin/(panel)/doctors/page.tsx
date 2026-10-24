import type { Metadata } from "next";
import Link from "next/link";
import { UserRoundPlus } from "lucide-react";
import { getAdminDoctors } from "@/lib/admin-queries";
import { DoctorsTable } from "@/components/admin/doctors-table";
import { formatFaNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مدیریت پزشکان",
  robots: { index: false, follow: false },
};

export default async function AdminDoctorsPage() {
  const items = await getAdminDoctors();
  const active = items.filter((d) => d.isActive).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">مدیریت پزشکان</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {formatFaNumber(items.length)} پزشک ثبت‌شده — {formatFaNumber(active)} پزشک فعال در سایت
          </p>
        </div>
        <Link
          href="/admin/doctors/new"
          className="flex items-center gap-2 rounded-xl bg-coral-500 px-5 py-3 text-sm font-extrabold text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600"
        >
          <UserRoundPlus className="size-4.5" />
          افزودن پزشک جدید
        </Link>
      </div>
      <DoctorsTable items={items} />
    </div>
  );
}
