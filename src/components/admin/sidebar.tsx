"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  CalendarHeart,
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "مدیریت نوبت‌ها", icon: CalendarDays },
  { href: "/admin/doctors", label: "مدیریت پزشکان", icon: Stethoscope },
  { href: "/admin/reviews", label: "مدیریت نظرات", icon: MessageSquareText },
  { href: "/admin/users", label: "مدیران سیستم", icon: ShieldCheck },
  { href: "/admin/settings", label: "ویرایش محتوای سایت", icon: SlidersHorizontal },
];

export function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 start-0 z-40 flex w-68 flex-col border-e border-jade-800 bg-jade-950 text-jade-100 max-lg:hidden">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <span className="grid size-11 place-items-center rounded-2xl bg-coral-500 text-cream">
          <CalendarHeart className="size-6" strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <p className="font-black text-cream">نوبت سلامت</p>
          <p className="text-[11px] font-bold text-jade-300">پنل مدیریت</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-extrabold transition-all",
                active
                  ? "bg-coral-500 text-cream shadow-lift"
                  : "text-jade-200/80 hover:bg-white/5 hover:text-cream"
              )}
            >
              <item.icon className="size-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + actions */}
      <div className="space-y-1.5 border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
          <span className="grid size-9 place-items-center rounded-full bg-jade-700 text-sm font-black text-cream">
            {username[0]?.toUpperCase()}
          </span>
          <div className="text-xs leading-5">
            <p className="font-black text-cream">{username}</p>
            <p className="text-jade-300/80">مدیر سیستم</p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-jade-200/80 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <Globe className="size-4.5" />
          مشاهده سایت
        </Link>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-coral-300 transition-colors hover:bg-coral-500/10 hover:text-coral-200"
        >
          {loggingOut ? <Loader2 className="size-4.5 animate-spin" /> : <LogOut className="size-4.5" />}
          خروج از حساب
        </button>
      </div>
    </aside>
  );
}
