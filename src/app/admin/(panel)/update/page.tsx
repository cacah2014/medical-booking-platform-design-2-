import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { UpdatePanel } from "@/components/admin/update-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "بروزرسانی پروژه",
  robots: { index: false, follow: false },
};

export default function AdminUpdatePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">بروزرسانی پروژه</h1>
        <p className="mt-1 text-sm text-ink-soft">
          به‌روزرسانی خودکار سایت از مخزن Git — بدون نیاز به SSH
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sun-300 bg-sun-100/60 px-5 py-4">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-sun-600" />
        <div className="text-xs leading-6 text-ink">
          <p className="font-black">قبل از شروع بدانید:</p>
          <p className="mt-1 text-ink-soft">
            به‌روزرسانی چند دقیقه طول می‌کشد و در مرحله ری‌استارت، سایت چند ثانیه در دسترس نخواهد بود.
            اگر بیلد شکست بخورد، نسخه فعلی سایت سالم می‌ماند. این قابلیت فقط روی VPS (با Git و PM2) کامل کار می‌کند.
          </p>
        </div>
      </div>

      <UpdatePanel />
    </div>
  );
}
