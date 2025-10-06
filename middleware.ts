import { NextRequest, NextResponse } from 'next/server';

// In-memory buckets (NOT for multi-instance production). Reuse pattern from rateLimit but scoped here to avoid import in edge.
interface Bucket { c: number; w: number; }
const buckets = new Map<string, Bucket>();

function publicRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b) { buckets.set(key, { c: 1, w: now }); return { allowed: true, remaining: limit - 1 }; }
  if (now - b.w >= windowMs) { b.c = 1; b.w = now; return { allowed: true, remaining: limit - 1 }; }
  if (b.c >= limit) return { allowed: false, remaining: 0, retryAfter: Math.ceil((b.w + windowMs - now)/1000) };
  b.c++; return { allowed: true, remaining: limit - b.c };
}

const SECURITY_HEADERS: Record<string,string> = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-xss-protection': '0', // modern browsers rely on CSP
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin'
};

// Basic CSP allowing self + images from unsplash (present in content) – adjust as needed.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // 'unsafe-inline' can be removed after auditing inline usage
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'"
].join('; ');

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Apply public API rate limit for selected endpoints
  const isPublicRateLimited = pathname.startsWith('/api/search') || pathname.startsWith('/api/orders');
  if (isPublicRateLimited) {
    const limit = parseInt(process.env.PUBLIC_RATE_LIMIT || '60', 10) || 60; // default 60 / 5m
    const windowMs = parseInt(process.env.PUBLIC_RATE_WINDOW_MS || String(5 * 60_000), 10) || 300_000;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
    const rl = publicRateLimit(`pub:${pathname}:${ip}`, limit, windowMs);
    if (!rl.allowed) {
      const res429 = NextResponse.json({ error: 'RATE_LIMIT', retryAfter: rl.retryAfter }, { status: 429 });
      res429.headers.set('retry-after', String(rl.retryAfter || 0));
      for (const [k,v] of Object.entries(SECURITY_HEADERS)) res429.headers.set(k, v);
      res429.headers.set('content-security-policy', CSP);
      return res429;
    }
  }

  const res = NextResponse.next();
  for (const [k,v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  res.headers.set('content-security-policy', CSP);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|webp)$).*)'
  ]
};
