import { NextRequest, NextResponse } from "next/server";
import { count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/passwords";

const USERNAME_RE = /^[a-zA-Z0-9_.@-]{3,40}$/;

function checkPasswordStrength(pw: string): string | null {
  if (pw.length < 8) return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return "رمز عبور باید شامل حرف و عدد باشد.";
  return null;
}

/* List admins */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  const rows = await db
    .select({ id: adminUsers.id, username: adminUsers.username, createdAt: adminUsers.createdAt })
    .from(adminUsers);
  return NextResponse.json({ admins: rows });
}

/* Create a new admin */
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ error: "نام کاربری باید ۳ تا ۴۰ حرف لاتین، عدد یا ـ باشد (بدون فاصله)." }, { status: 400 });
  }
  const pwError = checkPasswordStrength(password);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  if (existing[0]) {
    return NextResponse.json({ error: "این نام کاربری قبلاً وجود دارد." }, { status: 409 });
  }

  const inserted = await db
    .insert(adminUsers)
    .values({ username, passwordHash: hashPassword(password) })
    .returning({ id: adminUsers.id, username: adminUsers.username });

  return NextResponse.json({ ok: true, admin: inserted[0] }, { status: 201 });
}

/* Change own password OR reset another admin's password */
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  let body: { mode?: string; id?: number; currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const newPassword = String(body.newPassword ?? "");
  const pwError = checkPasswordStrength(newPassword);
  if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });

  /* Self change — current password required */
  if (body.mode === "self") {
    const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, session.uid)).limit(1);
    const me = rows[0];
    if (!me) return NextResponse.json({ error: "مدیر یافت نشد." }, { status: 404 });
    if (!verifyPassword(String(body.currentPassword ?? ""), me.passwordHash)) {
      return NextResponse.json({ error: "رمز عبور فعلی اشتباه است." }, { status: 403 });
    }
    await db.update(adminUsers).set({ passwordHash: hashPassword(newPassword) }).where(eq(adminUsers.id, me.id));
    return NextResponse.json({ ok: true });
  }

  /* Reset another admin */
  const id = Number(body.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "مدیر نامعتبر است." }, { status: 400 });
  if (id === session.uid) {
    return NextResponse.json({ error: "برای تغییر رمز خودتان از کارت «حساب من» استفاده کنید." }, { status: 400 });
  }
  const updated = await db
    .update(adminUsers)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(adminUsers.id, id))
    .returning({ id: adminUsers.id });
  if (!updated[0]) return NextResponse.json({ error: "مدیر یافت نشد." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/* Delete an admin (not self, not the last one) */
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "مدیر نامعتبر است." }, { status: 400 });
  if (id === session.uid) {
    return NextResponse.json({ error: "نمی‌توانید حساب خودتان را حذف کنید." }, { status: 400 });
  }

  const [{ value: total }] = await db.select({ value: count() }).from(adminUsers);
  if (total <= 1) {
    return NextResponse.json({ error: "حداقل یک مدیر باید در سیستم باقی بماند." }, { status: 400 });
  }

  const deleted = await db
    .delete(adminUsers)
    .where(eq(adminUsers.id, id))
    .returning({ id: adminUsers.id });
  if (!deleted[0]) return NextResponse.json({ error: "مدیر یافت نشد." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
