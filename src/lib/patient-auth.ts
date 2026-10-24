import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patients, type Patient } from "@/db/schema";

export const PATIENT_COOKIE = "ns_patient_session";
export const PATIENT_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const SECRET = process.env.PATIENT_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "nobat-patient-dev-secret-1404";

export interface PatientSession {
  pid: number;
  phone: string;
  exp: number;
}

export function signPatientSession(session: PatientSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyPatientSession(token: string | undefined): PatientSession | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as PatientSession;
    if (!data.exp || data.exp < Date.now() || !Number.isFinite(data.pid)) return null;
    return data;
  } catch {
    return null;
  }
}

/** Cookie-only session check (no DB hit) — for attaching patientId during booking */
export async function getPatientSession(): Promise<PatientSession | null> {
  const store = await cookies();
  return verifyPatientSession(store.get(PATIENT_COOKIE)?.value);
}

/** Full patient lookup — verifies both the cookie and the DB row */
export async function getPatient(): Promise<Patient | null> {
  const session = await getPatientSession();
  if (!session) return null;
  const rows = await db.select().from(patients).where(eq(patients.id, session.pid)).limit(1);
  return rows[0] ?? null;
}

export function hashOtpCode(phone: string, code: string): string {
  return createHash("sha256").update(`${phone}:${code}:nobat-salamat`).digest("hex");
}
