import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { doctors, reviews } from "@/db/schema";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const doctorId = Number(body.doctorId);
  const authorName = String(body.authorName ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating)) || 0));
  const visitType = body.visitType === "online" ? "online" : "inperson";

  if (!Number.isFinite(doctorId)) {
    return NextResponse.json({ error: "پزشک نامعتبر است." }, { status: 400 });
  }
  if (authorName.length < 2) {
    return NextResponse.json({ error: "نام خود را وارد کنید." }, { status: 400 });
  }
  if (comment.length < 10) {
    return NextResponse.json({ error: "متن نظر باید حداقل ۱۰ کاراکتر باشد." }, { status: 400 });
  }

  const rows = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);
  const doctor = rows[0];
  if (!doctor) {
    return NextResponse.json({ error: "پزشک یافت نشد." }, { status: 404 });
  }

  await db.insert(reviews).values({ doctorId, authorName, rating, comment, visitType });

  // Roll the new review into the doctor aggregate stats
  const avg = (Number(doctor.rating) * doctor.reviewsCount + rating) / (doctor.reviewsCount + 1);
  await db
    .update(doctors)
    .set({
      rating: avg.toFixed(1),
      reviewsCount: sql`${doctors.reviewsCount} + 1`,
    })
    .where(eq(doctors.id, doctorId));

  return NextResponse.json({ ok: true }, { status: 201 });
}
