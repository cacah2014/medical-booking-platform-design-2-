import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyPassword } from "@/lib/passwords";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { ADMIN_COOKIE, SESSION_MAX_AGE, signSession, getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  if (!username || !password) {
    return NextResponse.json({ error: "نام کاربری و رمز عبور را وارد کنید." }, { status: 400 });
  }

  // Brute-force guard: max 6 attempts per IP+username per 10 minutes
  const limit = rateLimit(`admin-login:${clientIp(req)}:${username}`, 6, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "تلاش‌های ورود بیش از حد مجاز است؛ لطفاً چند دقیقه دیگر تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const rows = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
  }

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
