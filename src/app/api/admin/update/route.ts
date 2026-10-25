import { NextResponse } from "next/server";
import { spawn, execSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getAdminSession } from "@/lib/auth";

const ROOT = process.cwd();
const LOG_FILE = join(ROOT, ".update-log.txt");
const PID_FILE = join(ROOT, ".update.pid");

const STEP_NAMES = [
  "دریافت آخرین کد (git pull)",
  "Dependency — نصب وابستگی‌ها (npm ci)",
  "Database — به‌روزرسانی دیتابیس",
  "Code — بیلد پروژه",
  "Update — ری‌استارت سرویس",
];

type StepStatus = "pending" | "running" | "done" | "failed" | "skipped";

function sh(cmd: string): string {
  try {
    return execSync(cmd, { cwd: ROOT, timeout: 9000, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function readStatus() {
  const steps: { name: string; status: StepStatus }[] = STEP_NAMES.map((name) => ({ name, status: "pending" as StepStatus }));
  let logTail = "";
  let commit: string | null = null;

  if (existsSync(LOG_FILE)) {
    const log = readFileSync(LOG_FILE, "utf8");
    logTail = log.split("\n").slice(-60).join("\n");
    for (const line of log.split("\n")) {
      const m = line.match(/^##STEP:(\d):(START|DONE|FAIL|SKIP)/);
      if (m) {
        const idx = Number(m[1]);
        if (steps[idx]) {
          steps[idx].status =
            m[2] === "START" ? "running" : m[2] === "DONE" ? "done" : m[2] === "FAIL" ? "failed" : "skipped";
        }
      }
      const c = line.match(/^##COMMIT:(\S+)/);
      if (c) commit = c[1];
    }
  }

  let running = false;
  if (existsSync(PID_FILE)) {
    const pid = Number(readFileSync(PID_FILE, "utf8"));
    if (Number.isFinite(pid)) {
      try {
        process.kill(pid, 0);
        running = true;
      } catch {
        running = false;
      }
    }
  }

  // Race-safety: اگر فرآیند تازه اسپاون شده و هنوز pid ننوشته/یا تازه تمام شده
  if (!running && existsSync(LOG_FILE)) {
    const mtime = statSync(LOG_FILE).mtimeMs;
    const hasTerminal =
      /^##STEP:\d:FAIL/m.test(logTail) || /^##STEP:4:(DONE|SKIP)/m.test(logTail);
    const recent = Date.now() - mtime < 2 * 60_000;
    if (recent && !hasTerminal) running = true;
  }

  return { steps, logTail, running, commit };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  const status = readStatus();
  const currentCommit = sh("git rev-parse --short HEAD") || null;
  const currentSubject = sh('git log -1 --pretty=format:"%s"')?.replaceAll('"', "") || null;
  const latestRemoteRaw = sh("git ls-remote origin main");
  const latestCommit = latestRemoteRaw ? latestRemoteRaw.split(/\s+/)[0].slice(0, 7) : null;

  return NextResponse.json({
    ...status,
    git: {
      available: Boolean(currentCommit),
      current: currentCommit,
      subject: currentSubject,
      latest: latestCommit,
      updateAvailable: Boolean(currentCommit && latestCommit && currentCommit !== latestCommit),
    },
  });
}

export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز." }, { status: 401 });

  if (readStatus().running) {
    return NextResponse.json({ error: "به‌روزرسانی در حال اجرا است؛ لطفاً تا پایان آن صبر کنید." }, { status: 409 });
  }

  try {
    // کپی اسکریپت در مسیر موقت تا «git pull» فایلِ در حال اجرا را بازنویسی نکند
    copyFileSync(join(ROOT, "scripts/self-update.sh"), "/tmp/ns-self-update.sh");
    writeFileSync(LOG_FILE, "");
    // اجرای دیتACHED در پس‌زمینه؛ خروجی به فایل لاگ می‌ریزد
    spawn("bash", ["-c", `bash /tmp/ns-self-update.sh >> "${LOG_FILE}" 2>&1`], {
      cwd: ROOT,
      detached: true,
      stdio: "ignore",
      env: {
        ...process.env,
        APP_DIR: ROOT,
        // بر اساس NODE_ENV=production محیط اپ، npm ممکن است dev deps را نصب نکند
        npm_config_include: "dev",
      },
    }).unref();
    return NextResponse.json({ ok: true, message: "به‌روزرسانی شروع شد." }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "اجرای اسکریپت به‌روزرسانی ناموفق بود." }, { status: 500 });
  }
}
