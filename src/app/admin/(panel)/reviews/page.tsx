import type { Metadata } from "next";
import { getAdminReviews } from "@/lib/admin-queries";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { formatFaNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مدیریت نظرات",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  const items = await getAdminReviews();
  const published = items.filter((r) => r.isPublished).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">مدیریت نظرات</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {formatFaNumber(items.length)} نظر ثبت‌شده — {formatFaNumber(published)} نظر منتشرشده در سایت
        </p>
      </div>
      <ReviewsTable items={items} />
    </div>
  );
}
