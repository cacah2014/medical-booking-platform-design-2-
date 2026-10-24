import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/db";
import { cities, specialties } from "@/db/schema";
import { NewDoctorForm } from "@/components/admin/new-doctor-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "افزودن پزشک جدید",
  robots: { index: false, follow: false },
};

export default async function NewDoctorPage() {
  const [specs, cityRows] = await Promise.all([db.select().from(specialties), db.select().from(cities)]);

  return (
    <div>
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-bold text-ink-faint">
        <Link href="/admin/doctors" className="transition-colors hover:text-jade-700">مدیریت پزشکان</Link>
        <ChevronLeft className="size-3.5" />
        <span className="text-ink">افزودن پزشک جدید</span>
      </nav>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">افزودن پزشک جدید</h1>
        <p className="mt-1 text-sm text-ink-soft">پروفایل پزشک بلافاصله پس از ثبت، در سایت فعال می‌شود.</p>
      </div>
      <NewDoctorForm
        specialties={specs.map((s) => ({ id: s.id, name: s.name }))}
        cities={cityRows.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
