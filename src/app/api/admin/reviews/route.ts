import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { doctors, reviews } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";

/* Toggle review visibility */
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  let body: { id?: number; isPublished?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isFinite(id) || typeof body.isPublished !== "boolean") {
    return NextResponse.json({ error: "پارامترها نامعتبر است." }, { status: 400 });
  }

  const updated = await db.update(reviews).set({ isPublished: body.isPublished }).where(eq(reviews.id, id)).returning();
  if (!updated[0]) return NextResponse.json({ error: "نظر یافت نشد." }, { status: 404 });
  return NextResponse.json({ ok: true, isPublished: updated[0].isPublished });
}

/* Permanently delete a review and roll back the doctor's aggregate rating */
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "پارامتر نامعتبر است." }, { status: 400 });

  const rows = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  const review = rows[0];
  if (!review) return NextResponse.json({ error: "نظر یافت نشد." }, { status: 404 });

  await db.delete(reviews).where(eq(reviews.id, id));

  // Roll back doctor aggregate (approximate inverse of the running average)
  const docRows = await db.select().from(doctors).where(eq(doctors.id, review.doctorId)).limit(1);
  const doc = docRows[0];
  if (doc && doc.reviewsCount > 1) {
    const newCount = doc.reviewsCount - 1;
    const newAvg = (Number(doc.rating) * doc.reviewsCount - review.rating) / newCount;
    await db
      .update(doctors)
      .set({ rating: Math.min(5, Math.max(1, newAvg)).toFixed(1), reviewsCount: newCount })
      .where(eq(doctors.id, doc.id));
  }

  return NextResponse.json({ ok: true });
}
