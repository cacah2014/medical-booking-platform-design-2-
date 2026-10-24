<div dir="rtl">

# 🩺 نوبت سلامت — پلتفرم نوبت‌دهی آنلاین پزشک

**Nobatesalamat.ir** — وب‌اپلیکیشن فول‌استک رزرو نوبت پزشک، مشاوره آنلاین و مدیریت مطب، ساخته‌شده با Next.js 16 (App Router) ،PostgreSQL و Drizzle ORM.

## ✨ امکانات

| بخش | امکانات |
|---|---|
| 🌐 سایت عمومی | جستجوی پیشرفته پزشک (تخصص/شهر/جنسیت/آنلاین)، پروفایل پزشک با تقویم رزرو واقعی، نظرات بیماران، پیگیری نوبت با کد رهگیری، sitemap/robots داینامیک |
| 📱 کاربران | ورود/ثبت‌نام با موبایل + OTP (۵ رقمی، ۲ دقیقه انقضا، ضد brute-force)، پنل کاربری با لیست نوبت‌ها و لغو |
| 🛠️ پنل مدیریت | داشبورد آماری با نمودار، مدیریت نوبت‌ها/پزشکان/نظرات، افزودن پزشک |
| 🔐 امنیت | scrypt برای رمزها، سشن HMAC با کوکی HttpOnly، Rate Limiting، هدرهای امنیتی، اعتبارسنجی سمت سرور |

---

## 🚀 نصب روی سرور (Ubuntu + Node + PostgreSQL)

### ۱) پیش‌نیازها
```bash
# Node.js نسخه ۲۰ به بالا
node -v
# PostgreSQL نسخه ۱۴ به بالا
psql --version
```

### ۲) آماده‌سازی دیتابیس
```bash
sudo -u postgres psql -c "CREATE DATABASE nobatesalamat;"
sudo -u postgres psql -c "CREATE USER nobat WITH PASSWORD 'یک-رمز-قوی';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nobatesalamat TO nobat;"
```

### ۳) کلون و نصب وابستگی‌ها
```bash
git clone <آدرس-مخزن> && cd <پوشه-پروژه>
npm install
```

### ۴) ساخت فایل محیطی
فایل `.env.example` را به `.env` کپی کرده و پر کنید:
```bash
cp .env.example .env
# رازهای نشست را با مقدار تصادفی بسازید:
openssl rand -base64 48   # → ADMIN_SESSION_SECRET
openssl rand -base64 48   # → PATIENT_SESSION_SECRET
```

### ۵) ساخت جداول و داده اولیه
```bash
npx drizzle-kit push       # ساخت جداول
npx tsx scripts/seed.ts    # ⚠️ فقط اجرای اول — داده‌های نمونه + کاربر ادمین
```

### ۶) بیلد و اجرا
```bash
npm run build
npm run start              # پورت پیش‌فرض ۳۰۰۰ — با PORT=8080 قابل تغییر است
```

### ۷) اجرای دائمی با PM2 (پیشنهادی)
```bash
npm i -g pm2
pm2 start ecosystem.config.cjs   # فایل پیکربندی آماده در ریشه پروژه
pm2 save && pm2 startup
```

### ۸) وب‌سرور (Nginx) و HTTPS
- ریورس پراکسی به `127.0.0.1:3000` و فعال‌سازی SSL با Certbot
- **بررسی سلامت:** اندپوینت `GET /api/health` برای مانیتورینگ (UptimeRobot و…)

> 💡 **مسیر سریع:** یک‌بار `sudo bash scripts/setup-server.sh` روی اوبونتو ۲۴٫۰۴ تازه، همه مراحل بالا (Node، PM2، PostgreSQL، Nginx، فایروال) را خودکار انجام می‌دهد.

---

## 🔄 استقرار خودکار از روی Git (CI/CD)

پروژه برای **به‌روزرسانی خودکار با هر `git push`** آماده است؛ دو روش پشتیبانی می‌شود:

### روش ۱: GitHub Actions (پیشنهادی) ⭐

فایل `.github/workflows/deploy.yml` از قبل تنظیم شده است. روند کار:

```
git push → تست و بیلد در GitHub → اتصال SSH به سرور → اجرای scripts/deploy.sh → بیلد روی سرور → ری‌استارت PM2 → بررسی سلامت
```

**راه‌اندازی (۵ دقیقه):**

۱. روی کامپیوتر خود یک کلید SSH اختصاصی استقرار بسازید:
```bash
ssh-keygen -t ed25519 -f nobat-deploy-key -N ""
```

۲. کلید **عمومی** را به کاربر `deploy` روی سرور اضافه کنید:
```bash
cat nobat-deploy-key.pub | ssh root@SERVER "cat >> /home/deploy/.ssh/authorized_keys"
```

۳. کلید **خصوصی** و مشخصات سرور را در مخزن ثبت کنید:
مسیر `Settings → Secrets and variables → Actions → New repository secret`:

| Secret | مقدار |
|---|---|
| `SERVER_HOST` | آدرس IP یا دامنه سرور |
| `SERVER_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | محتوای فایل `nobat-deploy-key` |

۴. تمام! از این پس هر `git push origin main` → سرور خودکار به‌روز می‌شود.

> 🛡 **امنیت Pipeline:** اگر تست TypeScript یا بیلد در GitHub شکست بخورد، استقرار انجام نمی‌شود. اگر بیلد روی سرور خطا دهد، اسکریپت متوقف شده و **نسخه سالم قبلی به کار خود ادامه می‌دهد** — هیچ‌وقت سایت خراب نمی‌مانید.

### روش ۲: push مستقیم به سرور (بدون GitHub)

اگر نمی‌خواهید از GitHub استفاده کنید، هوک `post-receive` آماده است:

```bash
# روی سرور (یک‌بار):
git init --bare /srv/git/nobatesalamat.git
cp /var/www/nobatesalamat/scripts/post-receive /srv/git/nobatesalamat.git/hooks/post-receive
chmod +x /srv/git/nobatesalamat.git/hooks/post-receive

# روی کامپیوتر خود:
git remote add production ssh://deploy@SERVER/srv/git/nobatesalamat.git
git push production main   # ← استقرار خودکار
```

### اسکریپت استقرار (`scripts/deploy.sh`)

| دستور | عملکرد |
|---|---|
| `bash scripts/deploy.sh` | pull + نصب وابستگی + بیلد + ری‌استарт + چک سلامت |
| `RUN_MIGRATIONS=1 bash scripts/deploy.sh` | + اعمال تغییرات اسکیمای دیتابیس |
| `SKIP_GIT_PULL=1 bash scripts/deploy.sh` | فقط بیلد و ری‌استارت (برای هوک گیت) |

---

## 🔑 متغیرهای محیطی

| متغیر | الزامی؟ | توضیح |
|---|---|---|
| `DATABASE_URL` | ✅ | رشته اتصال PostgreSQL |
| `ADMIN_SESSION_SECRET` | ✅ پروداکشن | راز امضای سشن مدیر (در غیابِ آن یک مقدار توسعه استفاده می‌شود — در سرور حتماً تنظیم کنید) |
| `PATIENT_SESSION_SECRET` | ✅ پروداکشن | راز امضای سشن بیماران |
| `KAVENEGAR_API_KEY` | ⬜ | کلید کاوه‌نگار — **بدون آن حالت دمو فعال و کد OTP روی صفحه نشان داده می‌شود** |
| `KAVENEGAR_TEMPLATE` | ⬜ | نام قالب Verify (با متغیر `%token`) |

### 📨 فعال‌سازی پیامک واقعی
۱. در [kavenegar.com](https://kavenegar.com) حساب بسازید و یک **قالب Verify** (مثلاً با نام `nobatsalamat`) با متنِ دارای `%token` تعریف کنید.
۲. `KAVENEGAR_API_KEY` و `KAVENEGAR_TEMPLATE` را در `.env` بگذارید و برنامه را ری‌استارت کنید — حالت دمو خودکار خاموش می‌شود.

---

## 👤 دسترسی‌ها (پس از اجرای seed)

| نقش | مسیر | اطلاعات ورود |
|---|---|---|
| مدیر سیستم | `/admin/login` | یوزرنیم `admin` — رمز `Nobat@1404` ⚠️ حتماً عوض شود |
| بیمار | `/auth` | هر شماره موبایل + کد OTP |

## 📁 ساختار پروژه
```
src/
├─ app/                 # صفحات: (site) سایت عمومی + admin پنل مدیریت + api/
├─ components/          # کامپوننت‌های رابط کاربری (سایت، ادمین، فرم‌ها)
├─ db/                  # اتصال و اسکیمای Drizzle
└─ lib/                 # احراز هویت، اسلات‌ها، کوئری‌ها، rate-limit، sms
```

---

## ⚠️ چک‌لیست قبل از انتشار
- [ ] `.env` با مقادیر واقعی و رازهای تصادفی قوی
- [ ] تغییر رمز پیش‌فرض ادمین (از دیتابیس: جدول `admin_users`)
- [ ] تنظیم کلید کاوه‌نگار برای پیامک واقعی
- [ ] فایروال: فقط پورت‌های 80/443/22 باز باشند
- [ ] بکاپ منظم از دیتابیس (`pg_dump`)

</div>
