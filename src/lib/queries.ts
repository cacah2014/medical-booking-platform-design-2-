import { and, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "@/db";
import {
  appointments,
  cities,
  doctors,
  reviews,
  specialties,
  type DoctorWithMeta,
} from "@/db/schema";
import { firstAvailableDate } from "@/lib/slots";
import { relativeDayLabel, todayIranISO, weekdayOf } from "@/lib/utils";

export interface DoctorCardData extends DoctorWithMeta {
  firstSlotISO: string;
  firstSlotLabel: string;
}

function attachSlot(d: DoctorWithMeta): DoctorCardData {
  const iso = firstAvailableDate(d.workingDays ?? [], d.firstSlotWithinDays ?? 0);
  return { ...d, firstSlotISO: iso, firstSlotLabel: relativeDayLabel(iso) };
}

export async function getSpecialtiesWithCounts() {
  const specs = await db.select().from(specialties);
  const counts = await db
    .select({ specialtyId: doctors.specialtyId, value: count() })
    .from(doctors)
    .groupBy(doctors.specialtyId);
  const countMap = new Map(counts.map((c) => [c.specialtyId, c.value]));
  return specs.map((s) => ({ ...s, doctorCount: countMap.get(s.id) ?? 0 }));
}

export async function getCities() {
  return db.select().from(cities);
}

export interface DoctorFilters {
  q?: string;
  specialty?: string; // slug
  city?: string; // name
  gender?: string; // "male" | "female"
  type?: string; // "online"
  availableToday?: boolean;
  sort?: string;
}

export async function searchDoctors(filters: DoctorFilters): Promise<DoctorCardData[]> {
  const conditions = [eq(doctors.isActive, true)];
  if (filters.gender === "male" || filters.gender === "female") {
    conditions.push(eq(doctors.gender, filters.gender));
  }
  if (filters.type === "online") {
    conditions.push(eq(doctors.onlineConsult, true));
  }
  if (filters.q) {
    const like = `%${filters.q.trim()}%`;
    conditions.push(or(ilike(doctors.fullName, like), ilike(doctors.title, like))!);
  }

  const rows = await db
    .select({ doctor: doctors, specialty: specialties, city: cities })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .where(conditions.length ? and(...conditions) : undefined);

  let list: DoctorWithMeta[] = rows.map((r) => ({ ...r.doctor, specialty: r.specialty, city: r.city }));

  if (filters.specialty) {
    const slug = filters.specialty;
    list = list.filter((d) => d.specialty.slug === slug);
  }
  if (filters.city) {
    const c = filters.city;
    list = list.filter((d) => d.city.name === c);
  }
  if (filters.availableToday) {
    const todayWd = weekdayOf(todayIranISO());
    list = list.filter((d) => (d.workingDays ?? []).includes(todayWd));
  }

  const byRating = (a: DoctorWithMeta, b: DoctorWithMeta) =>
    Number(b.rating) - Number(a.rating) || b.reviewsCount - a.reviewsCount;

  switch (filters.sort) {
    case "rating":
      list.sort(byRating);
      break;
    case "experience":
      list.sort((a, b) => b.experienceYears - a.experienceYears);
      break;
    case "price-asc":
      list.sort((a, b) => a.consultPrice - b.consultPrice);
      break;
    case "price-desc":
      list.sort((a, b) => b.consultPrice - a.consultPrice);
      break;
    case "reviews":
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    default:
      // recommended: عنوان‌دارها + امتیاز
      list.sort((a, b) => byRating(a, b) || b.views - a.views);
  }

  return list.map(attachSlot);
}

export async function getDoctorBySlug(slug: string): Promise<DoctorWithMeta | null> {
  const rows = await db
    .select({ doctor: doctors, specialty: specialties, city: cities })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .where(and(eq(doctors.slug, slug), eq(doctors.isActive, true)))
    .limit(1);
  if (!rows[0]) return null;
  const r = rows[0];
  return { ...r.doctor, specialty: r.specialty, city: r.city };
}

export async function getFeaturedDoctors(limit = 8): Promise<DoctorCardData[]> {
  const rows = await db
    .select({ doctor: doctors, specialty: specialties, city: cities })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .where(eq(doctors.isActive, true))
    .orderBy(desc(doctors.rating), desc(doctors.reviewsCount))
    .limit(limit);
  return rows.map((r) => attachSlot({ ...r.doctor, specialty: r.specialty, city: r.city }));
}

export async function getSimilarDoctors(doctor: DoctorWithMeta, limit = 4): Promise<DoctorCardData[]> {
  const rows = await db
    .select({ doctor: doctors, specialty: specialties, city: cities })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .where(and(eq(doctors.specialtyId, doctor.specialtyId), ne(doctors.id, doctor.id), eq(doctors.isActive, true)))
    .orderBy(desc(doctors.rating))
    .limit(limit);
  return rows.map((r) => attachSlot({ ...r.doctor, specialty: r.specialty, city: r.city }));
}

export async function getReviewsForDoctor(doctorId: number) {
  return db
    .select()
    .from(reviews)
    .where(and(eq(reviews.doctorId, doctorId), eq(reviews.isPublished, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(20);
}

export async function getBookedTimes(doctorId: number, dateISO: string): Promise<string[]> {
  const booked = await db
    .select({ time: appointments.time })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.date, dateISO),
        ne(appointments.status, "cancelled")
      )
    );
  return booked.map((b) => b.time);
}

export async function getStats() {
  const [docCount] = await db.select({ value: count() }).from(doctors);
  const [revCount] = await db.select({ value: count() }).from(reviews);
  void revCount;
  return { doctors: docCount.value };
}
