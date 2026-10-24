import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { AdminsManager } from "@/components/admin/admins-manager";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مدیران سیستم",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  const rows = await db
    .select({ id: adminUsers.id, username: adminUsers.username, createdAt: adminUsers.createdAt })
    .from(adminUsers)
    .orderBy(asc(adminUsers.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">مدیران سیستم</h1>
        <p className="mt-1 text-sm text-ink-soft">
          افزودن مدیر جدید، تغییر رمز عبور و مدیریت دسترسی‌ها — اطلاعات ورود هرگز به کاربران سایت نمایش داده نمی‌شود.
        </p>
      </div>
      <AdminsManager
        admins={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        meId={session!.uid}
        meUsername={session!.username}
      />
    </div>
  );
}
