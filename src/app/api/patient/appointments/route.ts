import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getPatient } from "@/lib/patient-auth";

/* Patient cancels one of their own appointments */
export async function PATCH(req: NextRequest) {
  const patient = await getPatient();
  if (!patient) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید." }, { status: 401 });
  }

  let body: { trackingCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const trackingCode = String(body.trackingCode ?? "").trim().toUpperCase();
  if (!trackingCode) {
    return NextResponse.json({ error: "کد پیگیری نامعتبر است." }, { status: 400 });
  }

  const rows = await db.select().from(appointments).where(eq(appointments.trackingCode, trackingCode)).limit(1);
  const appt = rows[0];
  if (!appt) {
    return NextResponse.json({ error: "نوبت یافت نشد." }, { status: 404 });
  }

  // Ownership: linked patient id, or same phone (guest bookings with this number)
  const owns = appt.patientId === patient.id || appt.patientPhone === patient.phone;
  if (!owns) {
    return NextResponse.json({ error: "این نوبت متعلق به حساب شما نیست." }, { status: 403 });
  }
  if (appt.status !== "confirmed") {
    return NextResponse.json({ error: "فقط نوبت‌های تاییدشده قابل لغو هستند." }, { status: 400 });
  }

  await db
    .update(appointments)
    .set({ status: "cancelled" })
    .where(and(eq(appointments.id, appt.id)));

  return NextResponse.json({ ok: true, status: "cancelled" });
}
