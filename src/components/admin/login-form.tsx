"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert, Eye, EyeOff, Loader2, Lock, LogIn, User } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ورود ناموفق بود.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-black text-ink">نام کاربری</label>
        <div className="relative">
          <User className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field ps-11 !py-3.5"
            placeholder="admin"
            autoComplete="username"
            dir="ltr"
            style={{ textAlign: "left" }}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-black text-ink">رمز عبور</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-faint" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field ps-11 pe-11 !py-3.5"
            placeholder="••••••••"
            autoComplete="current-password"
            dir="ltr"
            style={{ textAlign: "left" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-jade-700"
            aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
          >
            {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-coral-50 px-4 py-3 text-xs font-bold text-coral-700">
          <CircleAlert className="size-4.5 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !username || !password}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-jade-700 py-4 text-sm font-black text-cream shadow-lift transition-all hover:-translate-y-0.5 hover:bg-jade-800 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-5 animate-spin" /> : <LogIn className="size-5" />}
        {loading ? "در حال ورود…" : "ورود به پنل مدیریت"}
      </button>
    </form>
  );
}
