import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cities, doctors, specialties } from "@/db/schema";
import { toEnDigits } from "@/lib/utils";

async function requireAdmin() {
  const { getAdminSession } = await import("@/lib/auth");
  return getAdminSession();
}

/* Create a new doctor */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const fullName = String(body.fullName ?? "").trim();
  const title = String(body.title ?? "").trim();
  const medicalCode = toEnDigits(String(body.medicalCode ?? "").trim());
  const consultPrice = Math.round(Number(body.consultPrice));
  const onlinePrice = body.onlinePrice ? Math.round(Number(body.onlinePrice)) : null;
  const onlineConsult = Boolean(body.onlineConsult);
  const experienceYears = Math.max(1, Math.round(Number(body.experienceYears)) || 1);
  const gender = body.gender === "female" ? "female" : "male";
  const specialtyId = Number(body.specialtyId);
  const cityId = Number(body.cityId);
  const clinicAddress = String(body.clinicAddress ?? "").trim() || null;
  const clinicPhone = toEnDigits(String(body.clinicPhone ?? "").trim()) || null;
  const bio = String(body.bio ?? "").trim() || null;
  const education = String(body.education ?? "").trim() || null;
  const image = String(body.image ?? "").trim() || null;
  const slotDuration = [20, 30, 45].includes(Number(body.slotDuration)) ? Number(body.slotDuration) : 30;
  const workingDays = Array.isArray(body.workingDays)
    ? body.workingDays.filter((d: any) => Number.isInteger(d) && d >= 0 && d <= 6)
    : [];

  if (fullName.length < 5) return NextResponse.json({ error: "نام پزشک را کامل وارد کنید." }, { status: 400 });
  if (!title) return NextResponse.json({ error: "عنوان تخصصی الزامی است." }, { status: 400 });
  if (!/^\d{5}$/.test(medicalCode)) return NextResponse.json({ error: "کد نظام پزشکی باید ۵ رقم باشد." }, { status: 400 });
  if (!Number.isFinite(consultPrice) || consultPrice < 50000) return NextResponse.json({ error: "هزینه ویزیت معتبر نیست." }, { status: 400 });
  if (!Number.isFinite(specialtyId) || !Number.isFinite(cityId)) return NextResponse.json({ error: "تخصص و شهر را انتخاب کنید." }, { status: 400 });
  if (workingDays.length === 0) return NextResponse.json({ error: "حداقل یک روز کاری انتخاب کنید." }, { status: 400 });

  const [spec, city] = await Promise.all([
    db.select().from(specialties).where(eq(specialties.id, specialtyId)).limit(1),
    db.select().from(cities).where(eq(cities.id, cityId)).limit(1),
  ]);
  if (!spec[0]) return NextResponse.json({ error: "تخصص نامعتبر است." }, { status: 400 });
  if (!city[0]) return NextResponse.json({ error: "شهر نامعتبر است." }, { status: 400 });

  // Build a unique slug from the medical code
  let slug = `dr-${medicalCode}`;
  for (let i = 1; i < 50; i++) {
    const existing = await db.select({ id: doctors.id }).from(doctors).where(eq(doctors.slug, slug)).limit(1);
    if (!existing[0]) break;
    slug = `dr-${medicalCode}-${i + 1}`;
  }

  await db.insert(doctors).values({
    fullName: fullName.startsWith("دکتر") ? fullName : `دکتر ${fullName}`,
    slug,
    gender,
    title,
    specialtyId,
    cityId,
    image,
    consultPrice,
    onlinePrice: onlineConsult ? onlinePrice : null,
    onlineConsult,
    medicalCode,
    clinicAddress,
    clinicPhone,
    bio,
    education,
    experienceYears,
    workingDays,
    shifts: [["09:00", "13:00"], ["16:00", "20:00"]],
    slotDuration,
  });

  return NextResponse.json({ ok: true, slug }, { status: 201 });
}

/* Toggle doctor flags: isActive / onlineConsult */
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });
  }

  let body: { id?: number; isActive?: boolean; onlineConsult?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "پزشک نامعتبر است." }, { status: 400 });

  const patch: Record<string, boolean> = {};
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.onlineConsult === "boolean") patch.onlineConsult = body.onlineConsult;
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "تغییری ارسال نشده است." }, { status: 400 });

  const updated = await db.update(doctors).set(patch).where(eq(doctors.id, id)).returning();
  if (!updated[0]) return NextResponse.json({ error: "پزشک یافت نشد." }, { status: 404 });

  return NextResponse.json({ ok: true, isActive: updated[0].isActive, onlineConsult: updated[0].onlineConsult });
}
