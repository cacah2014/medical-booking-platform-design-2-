import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ویرایش محتوای سایت",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-ink">ویرایش محتوای سایت</h1>
        <p className="mt-1 text-sm text-ink-soft">
          متن اطلاعیه، اطلاعات تماس و آمار نمایشی صفحه‌اصلی را اینجا تغییر دهید — ذخیره کنید تا فوراً روی سایت اعمال شود.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
