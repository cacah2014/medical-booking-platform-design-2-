import { and, count, desc, eq, gte, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  cities,
  doctors,
  reviews,
  specialties,
  type Appointment,
  type City,
  type Doctor,
  type Specialty,
} from "@/db/schema";
import { addDaysISO, todayIranISO } from "@/lib/utils";

export type AdminAppointment = Appointment & { doctor: Doctor; city: City };

export interface DashboardStats {
  doctorsTotal: number;
  doctorsActive: number;
  appointmentsTotal: number;
  appointmentsToday: number;
  appointmentsPending: number;
  reviewsTotal: number;
  revenueTotal: number;
  weekly: { date: string; count: number }[];
  topSpecialties: { name: string; count: number }[];
  recent: AdminAppointment[];
  topDoctors: { name: string; slug: string; title: string; rating: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = todayIranISO();
  const weekAgo = addDaysISO(today, -6);

  const [
    docTotal,
    docActive,
    apptTotal,
    apptToday,
    apptPending,
    revTotal,
    revenue,
    weeklyRows,
    recentRows,
    specRows,
    topDoctorRows,
  ] = await Promise.all([
    db.select({ value: count() }).from(doctors),
    db.select({ value: count() }).from(doctors).where(eq(doctors.isActive, true)),
    db.select({ value: count() }).from(appointments),
    db.select({ value: count() }).from(appointments).where(eq(appointments.date, today)),
    db.select({ value: count() }).from(appointments).where(eq(appointments.status, "confirmed")),
    db.select({ value: count() }).from(reviews),
    db
      .select({ value: sql<number>`coalesce(sum(${appointments.price}), 0)::int` })
      .from(appointments)
      .where(ne(appointments.status, "cancelled")),
    db
      .select({ date: appointments.date, value: count() })
      .from(appointments)
      .where(gte(appointments.date, weekAgo))
      .groupBy(appointments.date),
    db
      .select({ appointment: appointments, doctor: doctors, city: cities })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .innerJoin(cities, eq(doctors.cityId, cities.id))
      .orderBy(desc(appointments.createdAt))
      .limit(8),
    db
      .select({ name: specialties.name, value: count() })
      .from(doctors)
      .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
      .groupBy(specialties.name)
      .orderBy(desc(count()))
      .limit(5),
    db
      .select({
        name: doctors.fullName,
        slug: doctors.slug,
        title: doctors.title,
        rating: doctors.rating,
        value: count(),
      })
      .from(appointments)
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .groupBy(doctors.fullName, doctors.slug, doctors.title, doctors.rating)
      .orderBy(desc(count()))
      .limit(5),
  ]);

  const weeklyMap = new Map(weeklyRows.map((r) => [r.date, r.value]));
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const iso = addDaysISO(weekAgo, i);
    return { date: iso, count: weeklyMap.get(iso) ?? 0 };
  });

  return {
    doctorsTotal: docTotal[0].value,
    doctorsActive: docActive[0].value,
    appointmentsTotal: apptTotal[0].value,
    appointmentsToday: apptToday[0].value,
    appointmentsPending: apptPending[0].value,
    reviewsTotal: revTotal[0].value,
    revenueTotal: Number(revenue[0].value),
    weekly,
    topSpecialties: specRows.map((r) => ({ name: r.name, count: r.value })),
    recent: recentRows.map((r) => ({ ...r.appointment, doctor: r.doctor, city: r.city })),
    topDoctors: topDoctorRows.map((r) => ({
      name: r.name,
      slug: r.slug,
      title: r.title,
      rating: r.rating,
      count: r.value,
    })),
  };
}

export interface AdminApptFilters {
  status?: string;
  q?: string;
}

export async function getAdminAppointments(filters: AdminApptFilters): Promise<AdminAppointment[]> {
  const conditions = [];
  if (filters.status && ["confirmed", "cancelled", "completed"].includes(filters.status)) {
    conditions.push(eq(appointments.status, filters.status));
  }
  if (filters.q) {
    const like = `%${filters.q.trim()}%`;
    conditions.push(
      or(ilike(appointments.patientName, like), ilike(appointments.trackingCode, like), ilike(doctors.fullName, like))!
    );
  }

  const rows = await db
    .select({ appointment: appointments, doctor: doctors, city: cities })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(appointments.date), desc(appointments.time))
    .limit(200);

  return rows.map((r) => ({ ...r.appointment, doctor: r.doctor, city: r.city }));
}

export type AdminDoctor = Doctor & { specialty: Specialty; city: City; appointmentsCount: number };

export async function getAdminDoctors(): Promise<AdminDoctor[]> {
  const rows = await db
    .select({ doctor: doctors, specialty: specialties, city: cities })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .orderBy(desc(doctors.createdAt));

  const counts = await db
    .select({ doctorId: appointments.doctorId, value: count() })
    .from(appointments)
    .groupBy(appointments.doctorId);
  const map = new Map(counts.map((c) => [c.doctorId, c.value]));

  return rows.map((r) => ({
    ...r.doctor,
    specialty: r.specialty,
    city: r.city,
    appointmentsCount: map.get(r.doctor.id) ?? 0,
  }));
}

export type AdminReview = typeof reviews.$inferSelect & { doctorName: string; doctorSlug: string };

export async function getAdminReviews(): Promise<AdminReview[]> {
  const rows = await db
    .select({ review: reviews, doctorName: doctors.fullName, doctorSlug: doctors.slug })
    .from(reviews)
    .innerJoin(doctors, eq(reviews.doctorId, doctors.id))
    .orderBy(desc(reviews.createdAt))
    .limit(200);
  return rows.map((r) => ({ ...r.review, doctorName: r.doctorName, doctorSlug: r.doctorSlug }));
}
