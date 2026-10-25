import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyPassword } from "@/lib/passwords";
import { clearFailures, clientIp, rateLimit, recordFailure } from "@/lib/rate-limit";
import { ADMIN_COOKIE, SESSION_MAX_AGE, signSession, getAdminSession } from "@/lib/auth";
import { toEnDigits } from "@/lib/utils";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  // نرمال‌سازی: تبدیل اعداد فارسی/عربی به لاتین و حذف فاصله‌های اضافی
  // (کاربران ایرانی ممکن است با کیبورد فارسی رمز تایپ کنند: ۱۴۰۴ به‌جای 1404)
  const username = toEnDigits(String(body.username ?? "")).trim();
  const password = toEnDigits(String(body.password ?? "")).trim();
  if (!username || !password) {
    return NextResponse.json({ error: "نام کاربری و رمز عبور را وارد کنید." }, { status: 400 });
  }

  // Brute-force guard: فقط تلاش‌های ناموفق شمرده می‌شوند؛ ورود موفق شمارنده را صفر می‌کند
  const rlKey = `admin-login:${clientIp(req)}:${username}`;
  const limit = rateLimit(rlKey, 6, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "تلاش‌های ورود بیش از حد مجاز است؛ لطفا ۱۰ دقیقه دیگر تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const rows = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordFailure(rlKey);
    return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
  }
  clearFailures(rlKey);

  const store = await cookies();
  store.set(
    ADMIN_COOKIE,
    signSession({ uid: user.id, username: user.username, exp: Date.now() + SESSION_MAX_AGE * 1000 }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    }
  );

  return NextResponse.json({ ok: true, username: user.username });
}

export async function GET() {
  const session = await getAdminSession();
  return NextResponse.json({ authenticated: Boolean(session), username: session?.username ?? null });
}
