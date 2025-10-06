import { NextRequest } from 'next/server';
import { buildUnifiedSearchRecords, writeUnifiedSearchIndex } from '@/lib/searchBuild';
import { rateLimit } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Simple shared-secret auth via header x-admin-secret matching env ADMIN_REBUILD_SEARCH_SECRET (or ADMIN_SECRET fallback)
function authorize(req: NextRequest) {
  const secret = process.env.ADMIN_REBUILD_SEARCH_SECRET || process.env.ADMIN_SECRET;
  if (!secret) return { ok: false, status: 500, message: 'Server misconfigured (no admin secret)' };
  const provided = req.headers.get('x-admin-secret') || req.nextUrl.searchParams.get('secret');
  if (!provided || provided !== secret) return { ok: false, status: 401, message: 'Unauthorized' };
  return { ok: true };
}

export async function POST(req: NextRequest) {
  const auth = authorize(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.message }), { status: auth.status, headers: { 'content-type': 'application/json' } });
  }
  // Rate limit (default 5 per 5 minutes unless overridden by env)
  const limit = parseInt(process.env.ADMIN_REBUILD_LIMIT || '5', 10) || 5;
  const windowMs = parseInt(process.env.ADMIN_REBUILD_WINDOW_MS || String(5 * 60_000), 10) || 300_000;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = rateLimit(`admin:rebuild:${ip}`, limit, windowMs);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: rl.retryAfter }), {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': String(rl.retryAfter || 0)
      }
    });
  }
  try {
    const started = Date.now();
  const { records, counts, version, generatedAt } = await buildUnifiedSearchRecords();
  writeUnifiedSearchIndex(records, process.cwd(), { version, generatedAt, counts });
    const ms = Date.now() - started;
    // Fire-and-forget audit log (do not block response on failure)
    // Attempt structured audit log if model exists; else raw insert
  const auditModel = (prisma as any).auditLog;
    if (auditModel && typeof auditModel.create === 'function') {
      auditModel.create({
        data: {
          action: 'REBUILD_SEARCH_INDEX',
          meta: { version, counts, generatedAt, durationMs: ms, ip }
        }
      }).catch(() => {});
    } else {
      // Fallback raw insert (best effort)
      try {
        const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
        // Use executeRawUnsafe only if available; ignore errors silently
        // @ts-ignore
        prisma.$executeRawUnsafe?.(
          'INSERT INTO AuditLog (id, action, meta, createdAt) VALUES (?, ?, ?, NOW())',
          id,
          'REBUILD_SEARCH_INDEX',
          JSON.stringify({ version, counts, generatedAt, durationMs: ms, ip })
        );
      } catch {}
    }
  return new Response(JSON.stringify({ ok: true, counts, version, generatedAt, durationMs: ms }), { status: 200, headers: { 'content-type': 'application/json', 'etag': `W/"${version}"` } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Rebuild failed', detail: e?.message || String(e) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export const dynamic = 'force-dynamic';