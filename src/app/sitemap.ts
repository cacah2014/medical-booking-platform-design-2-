import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { doctors, specialties } from "@/db/schema";

export const dynamic = "force-dynamic";

const BASE = "https://nobatesalamat.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [doctorRows, specialtyRows] = await Promise.all([
    db.select({ slug: doctors.slug }).from(doctors).where(eq(doctors.isActive, true)),
    db.select({ slug: specialties.slug }).from(specialties),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/doctors`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/track`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const specialtyPages: MetadataRoute.Sitemap = specialtyRows.map((s) => ({
    url: `${BASE}/doctors?specialty=${s.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const doctorPages: MetadataRoute.Sitemap = doctorRows.map((d) => ({
    url: `${BASE}/doctors/${d.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...specialtyPages, ...doctorPages];
}
