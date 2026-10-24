import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { otpCodes, patients } from "@/db/schema";
import {
  getPatient,
  hashOtpCode,
  PATIENT_COOKIE,
  PATIENT_SESSION_MAX_AGE,
  signPatientSession,
} from "@/lib/patient-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isSmsConfigured, sendOtpSms } from "@/lib/sms";
import { toEnDigits } from "@/lib/utils";

const OTP_TTL_MS = 120_000; // 2 minutes
const MAX_ATTEMPTS = 5;

function normalizePhone(raw: unknown): string {
  return toEnDigits(String(raw ?? "")).replace(/\D/g, "");
}

function setPatientCookie(store: Awaited<ReturnType<typeof cookies>>, pid: number, phone: string) {
  store.set(
    PATIENT_COOKIE,
    signPatientSession({ pid, phone, exp: Date.now() + PATIENT_SESSION_MAX_AGE * 1000 }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: PATIENT_SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    }
  );
}

/* GET → current patient (used by header + booking widget) */
export async function GET() {
  const patient = await getPatient();
  if (!patient) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    patient: {
      id: patient.id,
      phone: patient.phone,
      fullName: patient.fullName || "کاربر نوبت سلامت",
    },
  });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const action = String(body.action ?? "");
  const store = await cookies();

  /* ---------- logout ---------- */
  if (action === "logout") {
    store.delete(PATIENT_COOKIE);
    return NextResponse.json({ ok: true });
  }

  /* ---------- request OTP ---------- */
  if (action === "request") {
    const phone = normalizePhone(body.phone);
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹" }, { status: 400 });
    }

    // Throttle: max 4 OTP requests per phone per 10 minutes + per-IP cap
    const phoneLimit = rateLimit(`otp:phone:${phone}`, 4, 10 * 60_000);
    const ipLimit = rateLimit(`otp:ip:${clientIp(req)}`, 20, 10 * 60_000);
    if (!phoneLimit.ok || !ipLimit.ok) {
      return NextResponse.json(
        { error: "تعداد درخواست‌ها بیش از حد مجاز است؛ لطفاً چند دقیقه دیگر تلاش کنید." },
        { status: 429, headers: { "Retry-After": String(Math.max(phoneLimit.retryAfter, ipLimit.retryAfter)) } }
      );
    }

    const code = String(Math.floor(10000 + Math.random() * 90000));
    const smsConfigured = isSmsConfigured();

    if (smsConfigured) {
      const sent = await sendOtpSms(phone, code);
      if (!sent) {
        return NextResponse.json(
          { error: "ارسال پیامک با خطا مواجه شد؛ لطفاً چند لحظه دیگر دوباره تلاش کنید." },
          { status: 502 }
        );
      }
    } else {
      // حالت دمو: کد روی صفحه نمایش داده می‌شود
      console.log(`[OTP] login code for ${phone}: ${code}`);
    }

    await db.delete(otpCodes).where(eq(otpCodes.phone, phone));
    await db.insert(otpCodes).values({
      phone,
      codeHash: hashOtpCode(phone, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    return NextResponse.json({
      ok: true,
      expiresIn: OTP_TTL_MS / 1000,
      devCode: smsConfigured ? undefined : code,
      demo: !smsConfigured,
      message: "کد تایید برای شماره شما پیامک شد.",
    });
  }

  /* ---------- verify OTP ---------- */
  if (action === "verify") {
    const phone = normalizePhone(body.phone);
    const code = toEnDigits(String(body.code ?? "")).replace(/\D/g, "");
    const name = String(body.name ?? "").trim();

    if (!/^09\d{9}$/.test(phone) || code.length !== 5) {
      return NextResponse.json({ error: "شماره موبایل یا کد تایید نامعتبر است." }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(otpCodes)
      .where(eq(otpCodes.phone, phone))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
    const otp = rows[0];

    if (!otp || otp.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "کد تایید منقضی شده است. لطفاً کد جدید دریافت کنید." }, { status: 400 });
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "تعداد تلاش‌ها بیش از حد مجاز است. کد جدید دریافت کنید." }, { status: 429 });
    }

    if (otp.codeHash !== hashOtpCode(phone, code)) {
      await db
        .update(otpCodes)
        .set({ attempts: sql`${otpCodes.attempts} + 1` })
        .where(eq(otpCodes.id, otp.id));
      return NextResponse.json({ error: "کد تایید اشتباه است." }, { status: 400 });
    }

    // Existing patient → login
    const existing = await db.select().from(patients).where(eq(patients.phone, phone)).limit(1);
    if (existing[0]) {
      await db.delete(otpCodes).where(eq(otpCodes.phone, phone));
      setPatientCookie(store, existing[0].id, phone);
      return NextResponse.json({
        ok: true,
        isNew: false,
        patient: { id: existing[0].id, phone, fullName: existing[0].fullName || "کاربر نوبت سلامت" },
      });
    }

    // New patient → need a name first
    if (name.length < 3) {
      return NextResponse.json({ ok: false, needsName: true });
    }

    await db.delete(otpCodes).where(eq(otpCodes.phone, phone));
    let pid: number;
    try {
      const inserted = await db
        .insert(patients)
        .values({ phone, fullName: name })
        .returning({ id: patients.id });
      pid = inserted[0].id;
    } catch {
      const re = await db.select().from(patients).where(eq(patients.phone, phone)).limit(1);
      if (!re[0]) throw new Error("patient insert failed");
      pid = re[0].id;
    }

    setPatientCookie(store, pid, phone);
    return NextResponse.json({ ok: true, isNew: true, patient: { id: pid, phone, fullName: name } });
  }

  return NextResponse.json({ error: "عملیات نامعتبر است." }, { status: 400 });
}
