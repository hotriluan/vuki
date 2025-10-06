import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface CheckResult { name: string; ok: boolean; detail?: string; };

async function checkDb(): Promise<CheckResult> {
  if (!process.env.DATABASE_URL) return { name: 'db', ok: true, detail: 'no DATABASE_URL (skipped)' };
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { name: 'db', ok: true };
  } catch (e: any) {
    return { name: 'db', ok: false, detail: e?.code || e?.message || String(e) };
  }
}

function checkSearchIndex(): CheckResult {
  try {
    const metaPath = path.join(process.cwd(), 'public', 'search-index.meta.json');
    const idxPath = path.join(process.cwd(), 'public', 'search-index.json');
    if (!fs.existsSync(idxPath)) return { name: 'searchIndex', ok: false, detail: 'missing file' };
    const stat = fs.statSync(idxPath);
    if (stat.size === 0) return { name: 'searchIndex', ok: false, detail: 'empty file' };
    let freshness = 'unknown';
    let stale = false;
    if (fs.existsSync(metaPath)) {
      const metaRaw = fs.readFileSync(metaPath, 'utf8');
      const meta = JSON.parse(metaRaw);
      if (meta.generatedAt) {
        freshness = meta.generatedAt;
        const ageMs = Date.now() - Date.parse(meta.generatedAt);
        stale = ageMs > 1000 * 60 * 60 * 24; // >24h
      }
      return { name: 'searchIndex', ok: !stale, detail: stale ? `stale since ${freshness}` : `fresh at ${freshness}` };
    }
    return { name: 'searchIndex', ok: true, detail: 'exists (no meta)' };
  } catch (e: any) {
    return { name: 'searchIndex', ok: false, detail: e?.message || String(e) };
  }
}

export async function GET() {
  const [db] = await Promise.all([checkDb()]);
  const idx = checkSearchIndex();
  const checks = [db, idx];
  const ok = checks.every(c => c.ok);
  const status = ok ? 200 : 503;
  return new Response(JSON.stringify({ ok, checks, timestamp: new Date().toISOString() }), { status, headers: { 'content-type': 'application/json' } });
}