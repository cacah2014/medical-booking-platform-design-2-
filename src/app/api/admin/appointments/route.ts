import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";

const ALLOWED_STATUSES = new Set(["confirmed", "cancelled", "completed"]);

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  let body: { id?: number; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const id = Number(body.id);
  const status = String(body.status ?? "");
  if (!Number.isFinite(id) || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "پارامترها نامعتبر است." }, { status: 400 });
  }

  const updated = await db.update(appointments).set({ status }).where(eq(appointments.id, id)).returning();
  if (!updated[0]) {
    return NextResponse.json({ error: "نوبت یافت نشد." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, status: updated[0].status });
}
