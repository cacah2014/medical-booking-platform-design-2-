"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarHeart,
  ChevronDown,
  Menu,
  Phone,
  Search,
  Sparkles,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/doctors", label: "یافتن پزشک" },
  { href: "/doctors?type=online", label: "مشاوره آنلاین" },
  { href: "/track", label: "پیگیری نوبت" },
  { href: "/#specialties", label: "تخصص‌ها" },
  { href: "/#faq", label: "سوالات متداول" },
];

interface SiteHeaderProps {
  announcement?: string;
  phone?: string;
  phoneLink?: string;
}

export function SiteHeader({
  announcement = "رزرو نوبت در سراسر کشور — سریع، مطمئن و بدون کارمزد",
  phone = "۰۲۱-۹۱۳۰ ۴۵ ۶۷",
  phoneLink = "02191304567",
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Announcement strip */}
      <div className="relative overflow-hidden bg-jade-950 py-2 text-center text-[13px] font-medium text-jade-100">
        <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-40" />
        <p className="relative flex items-center justify-center gap-2 px-4">
          <Sparkles className="size-4 text-sun-300" />
          {announcement}
          <Sparkles className="size-4 text-sun-300" />
        </p>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-line/80 bg-cream/85 shadow-soft backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-jade-700 text-cream shadow-pop transition-transform duration-300 group-hover:-rotate-6 lg:size-11">
              <CalendarHeart className="size-5 lg:size-6" strokeWidth={2.2} />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-black tracking-tight text-jade-900 lg:text-xl">
                نوبت سلامت
              </span>
              <span className="hidden text-[10px] font-semibold tracking-[0.22em] text-jade-600/70 uppercase sm:block">
                Nobatesalamat.ir
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="mx-6 hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = item.href === "/track" && pathname === "/track";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-jade-50 hover:text-jade-800",
                    active && "bg-jade-100 text-jade-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <a
              href={`tel:${phoneLink}`}
              className="hidden items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-jade-300 hover:text-jade-800 md:flex"
            >
              <Phone className="size-4 text-jade-600" />
              <span dir="ltr">{phone}</span>
            </a>
            <UserMenu />
            <Link
              href="/doctors"
              className="grid size-10 place-items-center rounded-full border border-line bg-cream text-ink transition-colors hover:border-jade-300 md:hidden"
              aria-label="جستجو"
            >
              <Search className="size-5" />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="grid size-10 place-items-center rounded-full border border-line bg-cream text-ink lg:hidden"
              aria-label="منو"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "absolute inset-x-0 top-full origin-top border-b border-line bg-cream/98 shadow-lift backdrop-blur-xl transition-all duration-300 lg:hidden",
            open ? "visible scale-y-100 opacity-100" : "invisible scale-y-95 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-jade-50"
              >
                {item.label}
                <ChevronDown className="size-4 -rotate-90 text-ink-faint" />
              </Link>
            ))}
            <div className="mt-3 flex gap-2 border-t border-line pt-4">
              <Link
                href="/auth"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-coral-500 px-4 py-3 text-sm font-extrabold text-cream"
              >
                <UserRound className="size-4" />
                ورود | ثبت‌نام
              </Link>
              <Link
                href="/doctors?type=online"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-jade-700 px-4 py-3 text-sm font-extrabold text-cream"
              >
                <Video className="size-4" />
                مشاوره آنلاین
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
