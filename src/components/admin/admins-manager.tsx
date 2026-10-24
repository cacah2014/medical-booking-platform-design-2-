"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  Dices,
  KeyRound,
  Loader2,
  RotateCcw,
  ShieldPlus,
  Trash2,
  UserRoundCog,
} from "lucide-react";
import { cn, formatFaDate } from "@/lib/utils";

export interface AdminRow {
  id: number;
  username: string;
  createdAt: string;
}

function randomPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789@#%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function Message({ type, text }: { type: "ok" | "err"; text: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold",
        type === "ok" ? "bg-jade-50 text-jade-700" : "bg-coral-50 text-coral-700"
      )}
    >
      {type === "ok" ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}
      {text}
    </p>
  );
}

export function AdminsManager({ admins, meId, meUsername }: { admins: AdminRow[]; meId: number; meUsername: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* Self password */
  const [currentPw, setCurrentPw] = useState("");
  const [newPwSelf, setNewPwSelf] = useState("");

  /* New admin */
  const [nuUsername, setNuUsername] = useState("");
  const [nuPassword, setNuPassword] = useState("");

  /* Reset prompts */
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [resetPw, setResetPw] = useState("");

  async function call(init: RequestInit, body: unknown, method = "POST") {
    const res = await fetch("/api/admin/users", {
      ...init,
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "خطا در انجام عملیات.");
    return data;
  }

  async function changeSelf() {
    if (busy) return;
    setBusy("self");
    setMsg(null);
    try {
      await call({}, { mode: "self", currentPassword: currentPw, newPassword: newPwSelf }, "PATCH");
      setMsg({ type: "ok", text: "رمز عبور شما با موفقیت تغییر کرد." });
      setCurrentPw("");
      setNewPwSelf("");
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setBusy(null);
    }
  }

  async function addAdmin() {
    if (busy) return;
    setBusy("add");
    setMsg(null);
    try {
      await call({}, { username: nuUsername, password: nuPassword });
      setMsg({ type: "ok", text: `مدیر «${nuUsername}» اضافه شد. رمز را حتماً به او بدهید.` });
      setNuUsername("");
      setNuPassword("");
      router.refresh();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setBusy(null);
    }
  }

  async function resetPwOf(id: number) {
    if (busy) return;
    setBusy(`reset-${id}`);
    setMsg(null);
    try {
      await call({}, { mode: "reset", id, newPassword: resetPw }, "PATCH");
      setMsg({ type: "ok", text: "رمز مدیر بازنشانی شد." });
      setResettingId(null);
      setResetPw("");
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: number, username: string) {
    if (!confirm(`مدیر «${username}» برای همیشه حذف شود؟`)) return;
    setBusy(`del-${id}`);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "خطا در حذف.");
      setMsg({ type: "ok", text: `مدیر «${username}» حذف شد.` });
      router.refresh();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message });
    } finally {
      setBusy(null);
    }
  }

  const fieldCls =
    "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-all focus:border-jade-400 focus:ring-4 focus:ring-jade-400/15";

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      {/* My account */}
      <div className="space-y-4 xl:col-span-2">
        <section className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
          <h2 className="flex items-center gap-2.5 text-base font-black text-ink">
            <span className="grid size-9 place-items-center rounded-xl bg-jade-50">
              <UserRoundCog className="size-5 text-jade-700" />
            </span>
            حساب من — {meUsername}
          </h2>
          <p className="mt-1.5 text-xs text-ink-faint">برای تغییر رمز، رمز فعلی را وارد کنید.</p>
          <div className="mt-4 space-y-3">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="رمز فعلی"
              className={fieldCls}
              dir="ltr"
              style={{ textAlign: "left" }}
            />
            <input
              type="password"
              value={newPwSelf}
              onChange={(e) => setNewPwSelf(e.target.value)}
              placeholder="رمز جدید (حداقل ۸ کاراکتر، حرف + عدد)"
              className={fieldCls}
              dir="ltr"
              style={{ textAlign: "left" }}
            />
            <button
              onClick={changeSelf}
              disabled={busy === "self" || !currentPw || !newPwSelf}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-jade-700 py-3 text-sm font-extrabold text-cream transition-colors hover:bg-jade-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "self" ? <Loader2 className="size-4.5 animate-spin" /> : <KeyRound className="size-4.5" />}
              تغییر رمز من
            </button>
          </div>
        </section>

        {/* Add admin */}
        <section className="rounded-3xl border border-line bg-cream p-6 shadow-soft">
          <h2 className="flex items-center gap-2.5 text-base font-black text-ink">
            <span className="grid size-9 place-items-center rounded-xl bg-coral-100">
              <ShieldPlus className="size-5 text-coral-600" />
            </span>
            افزودن مدیر جدید
          </h2>
          <div className="mt-4 space-y-3">
            <input
              value={nuUsername}
              onChange={(e) => setNuUsername(e.target.value)}
              placeholder="نام کاربری (لاتین)"
              className={fieldCls}
              dir="ltr"
              style={{ textAlign: "left" }}
            />
            <div className="flex gap-2">
              <input
                value={nuPassword}
                onChange={(e) => setNuPassword(e.target.value)}
                placeholder="رمز عبور"
                className={fieldCls}
                dir="ltr"
                style={{ textAlign: "left" }}
              />
              <button
                type="button"
                onClick={() => setNuPassword(randomPassword())}
                className="grid w-12 shrink-0 place-items-center rounded-xl border border-line text-ink-faint transition-colors hover:border-jade-400 hover:text-jade-700"
                title="تولید رمز تصادفی"
              >
                <Dices className="size-5" />
              </button>
            </div>
            {nuPassword && (
              <p className="rounded-lg bg-sun-100/70 px-3 py-2 text-[11px] font-bold text-sun-600" dir="ltr">
                {nuPassword}
              </p>
            )}
            <button
              onClick={addAdmin}
              disabled={busy === "add" || nuUsername.length < 3 || nuPassword.length < 8}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-coral-500 py-3 text-sm font-extrabold text-cream transition-colors hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "add" ? <Loader2 className="size-4.5 animate-spin" /> : <ShieldPlus className="size-4.5" />}
              افزودن مدیر
            </button>
          </div>
        </section>
      </div>

      {/* Admins table */}
      <section className="rounded-3xl border border-line bg-cream shadow-soft xl:col-span-3">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-black text-ink">مدیران سیستم ({admins.length})</h2>
          <p className="mt-1 text-xs text-ink-faint">نام کاربری و رمز عبور فقط همین‌جا مدیریت می‌شود و هرگز در سایت نمایش داده نمی‌شود.</p>
        </div>
        {msg && <div className="mx-6 mt-4"><Message type={msg.type} text={msg.text} /></div>}
        <div className="divide-y divide-line/70">
          {admins.map((a) => {
            const isMe = a.id === meId;
            return (
              <div key={a.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-jade-700 text-sm font-black text-cream">
                    {a.username[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-extrabold text-ink" dir="ltr">
                      {a.username}
                      {isMe && (
                        <span className="rounded-full bg-coral-100 px-2 py-0.5 text-[10px] font-black text-coral-600">شما</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">
                      عضویت: {formatFaDate(String(a.createdAt).slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  {!isMe && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setResettingId(resettingId === a.id ? null : a.id);
                          setResetPw("");
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-sun-100 px-3 py-1.5 text-[11px] font-extrabold text-sun-600 transition-colors hover:bg-sun-300 hover:text-ink"
                      >
                        <RotateCcw className="size-3.5" />
                        بازنشانی رمز
                      </button>
                      <button
                        onClick={() => remove(a.id, a.username)}
                        disabled={busy === `del-${a.id}`}
                        className="grid size-8 place-items-center rounded-lg bg-coral-50 text-coral-600 transition-colors hover:bg-coral-500 hover:text-cream"
                        title="حذف مدیر"
                      >
                        {busy === `del-${a.id}` ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </button>
                    </div>
                  )}
                </div>

                {resettingId === a.id && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-paper p-3">
                    <input
                      value={resetPw}
                      onChange={(e) => setResetPw(e.target.value)}
                      placeholder="رمز جدید برای این مدیر"
                      className={fieldCls + " flex-1"}
                      dir="ltr"
                      style={{ textAlign: "left" }}
                    />
                    <button
                      onClick={() => setResetPw(randomPassword())}
                      className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-ink-faint hover:border-jade-400 hover:text-jade-700"
                      title="تولید رمز تصادفی"
                    >
                      <Dices className="size-4.5" />
                    </button>
                    <button
                      onClick={() => resetPwOf(a.id)}
                      disabled={resetPw.length < 8 || busy === `reset-${a.id}`}
                      className="rounded-xl bg-jade-700 px-4 py-2.5 text-xs font-extrabold text-cream hover:bg-jade-800 disabled:opacity-50"
                    >
                      {busy === `reset-${a.id}` ? <Loader2 className="size-4 animate-spin" /> : "تایید"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
