import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { invalidateAfterProductMutation } from '@/lib/invalidate';
import { logAdminAction } from '@/lib/audit';

// PATCH /api/admin/products/:id/variants
// Body: { variants: [{ id?, label, stock?, priceDiff?, overridePrice? }] }
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const list = Array.isArray(body?.variants) ? body.variants : [];
  const ifMatchUpdatedAt = typeof body?.updatedAt === 'string' ? body.updatedAt : '';
  // Basic validation
  const cleaned = list.map((v: any) => ({
    id: typeof v.id === 'string' && v.id.length ? v.id : undefined,
    label: typeof v.label === 'string' ? v.label.trim() : '',
    stock: Number.isFinite(v.stock) ? Math.max(0, parseInt(String(v.stock), 10)) : 0,
    priceDiff: v.priceDiff === null || v.priceDiff === undefined || v.priceDiff === '' ? null : (Number.isFinite(v.priceDiff) ? parseInt(String(v.priceDiff), 10) : null),
    overridePrice: v.overridePrice === null || v.overridePrice === undefined || v.overridePrice === '' ? undefined : (Number.isFinite(v.overridePrice) ? parseInt(String(v.overridePrice), 10) : undefined)
  })).filter((v: any) => v.label);

  try {
    // Fetch existing for diff
  const existing = await prisma.product.findUnique({ where: { id: params.id }, select: { variants: true, updatedAt: true } });
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (ifMatchUpdatedAt) {
      const sent = new Date(ifMatchUpdatedAt).getTime();
      const current = new Date(existing.updatedAt).getTime();
      if (!Number.isFinite(sent) || sent !== current) {
        return NextResponse.json({ error: 'Version conflict', conflict: true, current: { updatedAt: existing.updatedAt } }, { status: 409 });
      }
    }

    // Strategy: full replace (simpler) executed as a single update so updatedAt always bumps.
    // Use nested deleteMany + create to avoid two separate queries that might miss bump when list empty.
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        // bump updatedAt implicitly via @updatedAt and force variant replacement
        variants: {
          deleteMany: {},
          ...(cleaned.length ? { create: cleaned.map((v: any) => ({ label: v.label, stock: v.stock, priceDiff: v.priceDiff })) } : {})
        }
      },
      select: { id: true, updatedAt: true }
    });

    // Audit diff with before/after variant sets (only counts + labels for brevity)
  const beforeSummary = existing.variants.map((v: any) => ({ label: v.label, stock: v.stock, priceDiff: v.priceDiff }));
  const afterSummary = cleaned.map((v: any) => ({ label: v.label, stock: v.stock, priceDiff: v.priceDiff }));
  await logAdminAction('product.update', { userId: session.user.id, productId: params.id, diff: { variants: { beforeCount: beforeSummary.length, afterCount: afterSummary.length, beforeLabels: beforeSummary.map((v: any)=>v.label), afterLabels: afterSummary.map((v: any)=>v.label) } } });
    invalidateAfterProductMutation(params.id, { userId: session.user.id });
    return NextResponse.json({ ok: true, count: cleaned.length, updatedAt: updated.updatedAt });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update variants', detail: e?.message || 'unknown' }, { status: 500 });
  }
}
