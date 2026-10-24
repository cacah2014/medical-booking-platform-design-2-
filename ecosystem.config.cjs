/**
 * پیکربندی PM2 — اجرای دائمی نوبت سلامت روی سرور
 * راه‌اندازی:  pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: "nobatesalamat",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1, // Rate-limiter درون‌حافظه‌ای است؛ با مقیاس‌دهی به کلاستر، Redis لازم می‌شود
      exec_mode: "fork",
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
