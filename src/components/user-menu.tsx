"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleUserRound, UserRound } from "lucide-react";

interface PatientInfo {
  fullName: string;
}

export function UserMenu() {
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setPatient(data.patient);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return <span className="hidden h-10.5 w-32 animate-pulse rounded-full bg-sand md:block" />;
  }

  if (patient) {
    const firstName = patient.fullName.split(" ")[0] || "کاربر";
    return (
      <Link
        href="/profile"
        className="hidden items-center gap-2 rounded-full bg-jade-700 px-5 py-2.5 text-sm font-extrabold text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-jade-800 md:flex"
      >
        <CircleUserRound className="size-4.5" />
        سلام، {firstName}
      </Link>
    );
  }

  return (
    <Link
      href="/auth"
      className="hidden items-center gap-2 rounded-full bg-coral-500 px-5 py-2.5 text-sm font-extrabold text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-coral-600 md:flex"
    >
      <UserRound className="size-4" />
      ورود | ثبت‌نام
    </Link>
  );
}
