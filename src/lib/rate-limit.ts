/**
 * Lightweight in-memory fixed-window rate limiter.
 * Suitable for a single-process VPS deployment. For multi-instance
 * (serverless/cluster) deployments, swap with Redis (e.g. Upstash).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Opportunistic cleanup to prevent unbounded memory growth
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket) {
    // Only register the failure — checked AFTER caller knows the attempt failed
    buckets.set(key, { count: 0, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.resetAt < now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Register a failed attempt (called only when credentials are wrong) */
export function recordFailure(key: string) {
  const bucket = buckets.get(key);
  if (bucket) bucket.count += 1;
}

/** Clear failures after a successful login */
export function clearFailures(key: string) {
  buckets.delete(key);
}

export function clientIp(req: Request): string {
  return (
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
