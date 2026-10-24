#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# اسکریپت استقرار خودکار نوبت سلامت روی سرور
# استفاده:
#   bash scripts/deploy.sh            # به‌روزرسانی از origin
#   SKIP_GIT_PULL=1 bash scripts/deploy.sh   # فقط بیلد و ری‌استارت
#   RUN_MIGRATIONS=1 bash scripts/deploy.sh  # + اعمال تغییرات اسکیما
# ─────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/nobatesalamat}"
APP_NAME="${PM2_NAME:-nobatesalamat}"
BRANCH="${BRANCH:-main}"
PORT="${PORT:-3000}"

echo "▶ شروع استقرار «$APP_NAME» روی شاخه «$BRANCH» …"
cd "$APP_DIR"

# ۱) دریافت آخرین کد (مگر اینکه هوک گیت خودش چک‌اوت کرده باشد)
if [ "${SKIP_GIT_PULL:-0}" != "1" ]; then
  echo "▶ دریافت آخرین کد از origin/$BRANCH …"
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

# ۲) نصب دقیق وابستگی‌ها
echo "▶ نصب وابستگی‌ها …"
npm ci --no-audit --no-fund

# ۳) تغییرات اسکیمای دیتابیس (فقط اگر عمداً فعال شود — کار خطرناکی است)
if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  echo "⚠ اعمال تغییرات اسکیمای دیتابیس …"
  npx drizzle-kit push --force
fi

# ۴) بیلد پروداکشن — اگر شکست بخورد، اسکریپت متوقف و اپ قبلی سالم می‌ماند
echo "▶ بیلد پروداکشن …"
npm run build

# ۵) ری‌استارت با PM2 (اگر اجرا نشده بود، استارت می‌شود)
echo "▶ ری‌استارت سرویس …"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$APP_NAME" --update-env
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi

# ۶) بررسی سلامت — تا ۳۰ ثانیه
echo "▶ بررسی سلامت سرویس …"
for i in $(seq 1 10); do
  sleep 3
  if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    echo "✅ استقرار موفق — سرور سالم است (تلاش $i)"
    exit 0
  fi
done

echo "❌ بررسی سلامت ناموفق بود؛ وضعیت PM2 را بررسی کنید: pm2 logs $APP_NAME"
exit 1
