"use client";

import { useEffect } from "react";

/**
 * اگر صفحه داخل iframe (مثل پیش‌نمایش محصور در پلتفرم دیگر) باز شده باشد،
 * آن را به تب مستقل می‌شکند — چون کوکی‌های نشست با SameSite=Lax داخل iframe
 * بین‌دامنه‌ای ارسال نمی‌شوند و ورود کاربر ناموفق به نظر می‌رسد.
 */
export function FrameBreak() {
  useEffect(() => {
    try {
      if (window.top !== window.self) {
        window.top!.location.href = window.location.href;
      }
    } catch {
      // cross-origin frame → same fix attempt
      window.open(window.location.href, "_top");
    }
  }, []);
  return null;
}
