import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, or } from "drizzle-orm";
import { CalendarPlus, CircleUserRound, ClipboardList, History, Smartphone } from "lucide-react";
import { db } from "@/db";
import { appointments, cities, doctors, specialties } from "@/db/schema";
import { LogoutButton, ProfileAppointments } from "@/components/profile-client";
import { getPatient } from "@/lib/patient-auth";
import { formatFaNumber, toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "پنل کاربری",
  description: "مدیریت حساب کاربری و نوبت‌های شما در نوبت سلامت.",
};

export default async function ProfilePage() {
  const patient = await getPatient();
  if (!patient) {
    redirect("/auth?next=/profile");
  }

  const items = await db
    .select({ appt: appointments, doctor: doctors, city: cities, specialty: specialties })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .where(or(eq(appointments.patientId, patient.id), eq(appointments.patientPhone, patient.phone)))
    .orderBy(desc(appointments.createdAt))
    .limit(50);

  const list = items.map((r) => ({
    trackingCode: r.appt.trackingCode,
    status: r.appt.status,
    type: r.appt.type,
    date: r.appt.date,
    time: r.appt.time,
    price: r.appt.price,
    doctor: { name: r.doctor.fullName, title: r.doctor.title, slug: r.doctor.slug },
    city: r.city.name,
    specialty: r.specialty.name,
  }));

  const active = list.filter((a) => a.status === "confirmed").length;
  const done = list.filter((a) => a.status === "completed").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* User card */}
      <section className="relative overflow-hidden rounded-[2rem] bg-jade-950 p-7 text-cream shadow-pop sm:p-9">
        <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="grid size-18 place-items-center rounded-3xl bg-coral-500 text-3xl font-black text-cream sm:size-20">
            {(patient.fullName || "ک")[0]}
          </span>
          <div className="flex-1">
            <p className="flex items-center gap-2 text-xl font-black sm:text-2xl">
              {patient.fullName || "کاربر نوبت سلامت"}
              <CircleUserRound className="size-5 text-jade-300" />
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-jade-200">
              <Smartphone className="size-4" />
              <span dir="ltr">{toFa(patient.phone)}</span>
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="relative mt-7 grid grid-cols-3 gap-3">
          {[
            { icon: ClipboardList, label: "همه نوبت‌ها", value: list.length },
            { icon: CalendarPlus, label: "نوبت‌های فعال", value: active },
            { icon: History, label: "ویزیت انجام‌شده", value: done },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center">
              <s.icon className="mx-auto size-5 text-sun-300" />
              <p className="mt-2 text-xl font-black">{formatFaNumber(s.value)}</p>
              <p className="mt-0.5 text-[11px] font-bold text-jade-200/80">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Appointments */}
      <section className="mt-9">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-black text-ink sm:text-2xl">نوبت‌های من</h1>
          <Link
            href="/doctors"
            className="flex items-center gap-2 rounded-xl bg-coral-500 px-5 py-2.5 text-sm font-extrabold text-cream transition-all hover:-translate-y-0.5 hover:bg-coral-600"
          >
            <CalendarPlus className="size-4.5" />
            رزرو نوبت جدید
          </Link>
        </div>
        <ProfileAppointments items={list} />
      </section>
    </div>
  );
}
