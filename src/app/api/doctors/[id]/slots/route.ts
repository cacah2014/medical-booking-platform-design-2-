import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { doctors } from "@/db/schema";
import { getBookedTimes } from "@/lib/queries";
import { generateSlots, toMinutes } from "@/lib/slots";
import { nowIranMinutes, todayIranISO, weekdayOf } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doctorId = Number(id);
  const date = req.nextUrl.searchParams.get("date") ?? "";

  if (!Number.isFinite(doctorId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "پارامترها نامعتبر است." }, { status: 400 });
  }

  const rows = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
  const doctor = rows[0];
  if (!doctor) {
    return NextResponse.json({ error: "پزشک یافت نشد." }, { status: 404 });
  }

  if (!(doctor.workingDays ?? []).includes(weekdayOf(date))) {
    return NextResponse.json({ date, working: false, slots: [] });
  }

  const all = generateSlots(doctor.shifts ?? [], doctor.slotDuration);
  const booked = new Set(await getBookedTimes(doctorId, date));
  const isToday = date === todayIranISO();
  const cutoff = nowIranMinutes() + 60; // حداقل یک ساعت زمان لازم است

  const slots = all.map((time) => ({
    time,
    available: !booked.has(time) && (!isToday || toMinutes(time) > cutoff),
  }));

  return NextResponse.json({ date, working: true, slots });
}
