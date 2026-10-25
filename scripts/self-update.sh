#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# به‌روزرسانی خودکار پروژه از داخل پنل مدیریت
# هر مرحله با مارکر ##STEP  گزارش می‌شود تا UI وضعیت را بخواند.
# ─────────────────────────────────────────────────────────────
set -uo pipefail
# دایرکتوری کاری از طرف فراخواننده (API روت) گذاشته می‌شود؛
# چون اسکریپت در /tmp کپی و اجرا می‌شود، به مسیر خودش تکیه نکن.
cd "${APP_DIR:-.}"

echo $$ > .update.pid
trap 'rm -f .update.pid' EXIT

start() { echo "##STEP:$1:START"; }
done_() { echo "##STEP:$1:DONE"; }
skip_() { echo "##STEP:$1:SKIP"; }
fail()  { echo "##STEP:$1:FAIL"; exit 1; }

run() {
  # $1 = step number, $2... = command — prints output tail, keeps exit code
  local step_no="$1"; shift
  local out code
  out=$("$@" 2>&1); code=$?
  echo "$out" | tail -n 25
  return $code
}

# ─────────────────────────────── مرحله ۰: git pull
start 0
if git rev-parse --git-dir >/dev/null 2>&1; then
  if git pull --ff-only origin main >/dev/null 2>&1 || git pull origin main >/dev/null 2>&1; then
    echo "commit: $(git rev-parse --short HEAD)"
    done_ 0
  else
    echo "git pull ناموفق بود (شاید تداخل یا عدم اتصال) — ادامه با کد فعلی"
    skip_ 0
  fi
else
  echo "این نصب، مخزن Git نیست (احتمالاً آپلود دستی) — مرحله رد شد"
  skip_ 0
fi

# ─────────────────────────────── مرحله ۱: Dependency
# توجه: --include=dev حیاتی است؛ چون اپ با NODE_ENV=production اجرا می‌شود
# وگرنه devDependencies (typescript, drizzle-kit, tsx) پاک می‌شوند.
start 1
if [ -f package-lock.json ]; then
  run 1 npm ci --no-audit --no-fund --include=dev && done_ 1 || fail 1
else
  echo "package-lock.json موجود نیست — استفاده از npm install"
  run 1 npm install --no-audit --no-fund --include=dev && done_ 1 || fail 1
fi

# ─────────────────────────────── مرحله ۲: Database
start 2
run 2 npx --no-install drizzle-kit push --force && done_ 2 || fail 2

# ─────────────────────────────── مرحله ۳: Code (بیلد)
start 3
run 3 npm run build && done_ 3 || fail 3

# ─────────────────────────────── مرحله ۴: Update (ری‌استارت)
start 4
echo "##COMMIT:$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
if command -v pm2 >/dev/null 2>&1 && pm2 describe nobatesalamat >/dev/null 2>&1; then
  pm2 restart nobatesalamat >/dev/null 2>&1 || true
  done_ 4
else
  echo "PM2 یافت نشد — سرویس را دستی ری‌استارت کنید"
  skip_ 4
fi

exit 0
