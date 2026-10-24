#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# آماده‌سازی یک‌باره سرور اوبونتو ۲۴٫۰۴ برای نوبت سلامت
# اجرا با root یا کاربر دارای sudo:
#   sudo bash scripts/setup-server.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/USER/nobatesalamat.git}"
APP_DIR="/var/www/nobatesalamat"
DB_NAME="${DB_NAME:-nobatesalamat}"
DB_USER="${DB_USER:-nobat}"
NODE_MAJOR=20

echo "▶ نصب بسته‌های پایه …"
apt-get update -y
apt-get install -y curl git nginx postgresql postgresql-contrib ufw ca-certificates

echo "▶ نصب Node.js ${NODE_MAJOR}.x …"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

echo "▶ نصب PM2 …"
npm install -g pm2

echo "▶ ساخت دیتابیس PostgreSQL …"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || {
  DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  echo "★ DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}"
  echo "  (این مقدار را در فایل .env ذخیره کنید — فقط همین یک‌بار نمایش داده می‌شود)"
}

echo "▶ فایروال …"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "▶ کلون مخزن → ${APP_DIR} …"
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠ فایل .env ساخته شد — قبل از ادامه مقادیر آن را پر کنید: ${APP_DIR}/.env"
fi

echo "▶ ساخت کاربر deploy برای استقرار خودکار …"
if ! id -u deploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash deploy
fi
mkdir -p /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh "$APP_DIR"
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
echo "★ کلید عمومی SSH سرور CI را در /home/deploy/.ssh/authorized_keys قرار دهید"

cat > /etc/nginx/sites-available/nobatesalamat <<'NGINX'
server {
    listen 80;
    server_name nobatesalamat.ir www.nobatesalamat.ir;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/nobatesalamat /etc/nginx/sites-enabled/nobatesalamat
nginx -t && systemctl reload nginx

echo ""
echo "✅ آماده‌سازی کامل شد. گام‌های بعدی:"
echo "   ۱) nano ${APP_DIR}/.env  ← مقادیر را کامل کنید"
echo "   ۲) sudo -u deploy bash ${APP_DIR}/scripts/deploy.sh"
echo "   ۳) npx drizzle-kit push && npx tsx scripts/seed.ts  (فقط نصب اول)"
echo "   ۴) certbot --nginx -d nobatesalamat.ir   ← برای HTTPS"
echo "   ۵) pm2 startup systemd -u deploy --hp /home/deploy"
