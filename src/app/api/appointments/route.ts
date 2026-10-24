import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, cities, doctors, specialties } from "@/db/schema";
import { getBookedTimes } from "@/lib/queries";
import { getPatientSession } from "@/lib/patient-auth";
import { generateSlots } from "@/lib/slots";
import { generateTrackingCode, toEnDigits, weekdayOf } from "@/lib/utils";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const doctorId = Number(body.doctorId);
  const date = String(body.date ?? "");
  const time = String(body.time ?? "");
  const type = body.type === "online" ? "online" : "inperson";
  const patientName = String(body.patientName ?? "").trim();
  const patientPhone = toEnDigits(String(body.patientPhone ?? "").trim());
  const nationalCode = toEnDigits(String(body.nationalCode ?? "").trim()) || null;

  /* ---------- Validation ---------- */
  if (!Number.isFinite(doctorId)) {
    return NextResponse.json({ error: "پزشک نامعتبر است." }, { status: 400 });
  }
  if (patientName.length < 3) {
    return NextResponse.json({ error: "نام و نام خانوادگی را کامل وارد کنید." }, { status: 400 });
  }
  if (!/^09\d{9}$/.test(patientPhone)) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "زمان نوبت نامعتبر است." }, { status: 400 });
  }

  const rows = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
  const doctor = rows[0];
  if (!doctor) {
    return NextResponse.json({ error: "پزشک یافت نشد." }, { status: 404 });
  }
  if (type === "online" && !doctor.onlineConsult) {
    return NextResponse.json({ error: "این پزشک مشاوره آنلاین ندارد." }, { status: 400 });
  }

  /* ---------- Verify slot is genuinely available ---------- */
  if (!(doctor.workingDays ?? []).includes(weekdayOf(date))) {
    return NextResponse.json({ error: "پزشک در این روز ویزیت ندارد." }, { status: 400 });
  }
  const validSlots = generateSlots(doctor.shifts ?? [], doctor.slotDuration);
  if (!validSlots.includes(time)) {
    return NextResponse.json({ error: "ساعت انتخاب‌شده معتبر نیست." }, { status: 400 });
  }
  const booked = await getBookedTimes(doctorId, date);
  if (booked.includes(time)) {
    return NextResponse.json({ error: "این نوبت هم‌اکنون توسط بیمار دیگری رزرو شد. لطفاً ساعت دیگری انتخاب کنید." }, { status: 409 });
  }

  const price = type === "online" ? (doctor.onlinePrice ?? doctor.consultPrice) : doctor.consultPrice;
  const patientSession = await getPatientSession();

  /* ---------- Insert with unique tracking code ---------- */
  let trackingCode = generateTrackingCode();
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await db.insert(appointments).values({
        trackingCode,
        doctorId,
        patientId: patientSession?.pid ?? null,
        patientName,
        patientPhone,
        nationalCode,
        type,
        date,
        time,
        price,
        status: "confirmed",
      });
      return NextResponse.json(
        {
          ok: true,
          trackingCode,
          appointment: { doctorName: doctor.fullName, date, time, type, price, patientName },
        },
        { status: 201 }
      );
    } catch {
      trackingCode = generateTrackingCode();
    }
  }

  return NextResponse.json({ error: "خطا در ثبت نوبت. دوباره تلاش کنید." }, { status: 500 });
}

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "کد پیگیری وارد نشده است." }, { status: 400 });
  }

  const rows = await db
    .select({
      appointment: appointments,
      doctor: doctors,
      specialty: specialties,
      city: cities,
    })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .innerJoin(cities, eq(doctors.cityId, cities.id))
    .where(and(eq(appointments.trackingCode, code)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "نوبتی با این کد پیگیری یافت نشد." }, { status: 404 });
  }

  return NextResponse.json({
    trackingCode: row.appointment.trackingCode,
    status: row.appointment.status,
    type: row.appointment.type,
    date: row.appointment.date,
    time: row.appointment.time,
    price: row.appointment.price,
    patientName: row.appointment.patientName,
    doctor: {
      name: row.doctor.fullName,
      title: row.doctor.title,
      slug: row.doctor.slug,
      clinicAddress: row.doctor.clinicAddress,
      clinicPhone: row.doctor.clinicPhone,
      city: row.city.name,
      specialty: row.specialty.name,
    },
  });
}
