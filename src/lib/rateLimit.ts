// Simple in-memory rate limiter (fixed window or sliding token)
// NOT for multi-instance production (would need Redis or durable store)

interface BucketState { count: number; windowStart: number; }

const buckets = new Map<string, BucketState>();

export interface RateLimitResult { allowed: boolean; remaining: number; limit: number; retryAfter?: number; }

export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, limit };
  }
  if (now - bucket.windowStart >= windowMs) {
    bucket.count = 1;
    bucket.windowStart = now;
    return { allowed: true, remaining: limit - 1, limit };
  }
  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, limit, retryAfter };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, limit };
}

export function resetRateLimit(keyPrefix?: string) {
  if (!keyPrefix) buckets.clear();
  else {
    for (const k of buckets.keys()) if (k.startsWith(keyPrefix)) buckets.delete(k);
  }
}