import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** scrypt hash in `salt:hash` format — safe to run anywhere (seed scripts included) */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const calc = scryptSync(password, salt, 64);
  const target = Buffer.from(hash, "hex");
  return calc.length === target.length && timingSafeEqual(calc, target);
}
