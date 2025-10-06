import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { invalidateAfterProductMutation } from '@/lib/invalidate';
import { logAdminAction } from '@/lib/audit';

// POST /api/admin/products/bulk  { action: 'publish'|'unpublish'|'delete', ids: string[] }
export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: any; try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((v: any) => typeof v === 'string') : [];
  const action = body?.action;
  if (!ids.length) return NextResponse.json({ error: 'No ids' }, { status: 400 });
  if (!['publish','unpublish','delete'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  try {
    if (action === 'delete') {
      // Task 9 hard: hard cascade variants only for products newly soft-deleted in this call.
      const active = await prisma.product.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true } });
      const toDeleteIds = active.map(p => p.id);
      if (toDeleteIds.length) {
        const now = new Date();
        const [, variantDeletion] = await prisma.$transaction([
          prisma.product.updateMany({ where: { id: { in: toDeleteIds }, deletedAt: null }, data: { deletedAt: now } }),
          prisma.productVariant.deleteMany({ where: { productId: { in: toDeleteIds } } })
        ]);
        await logAdminAction('product.update', { userId: session.user.id, bulk: true, action: 'delete', count: toDeleteIds.length, variantCascadeDeletedCount: variantDeletion.count });
      } else {
        await logAdminAction('product.update', { userId: session.user.id, bulk: true, action: 'delete', count: 0, variantCascadeDeletedCount: 0, note: 'All already deleted' });
      }
    } else if (action === 'publish') {
      const before = await prisma.product.findMany({ where: { id: { in: ids } } });
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: 'PUBLISHED', publishedAt: new Date() } as any });
      const diff = { status: { before: before.map(b=>({ id: b.id, status: (b as any).status })), after: 'PUBLISHED' } };
      await logAdminAction('product.update', { userId: session.user.id, bulk: true, action, count: ids.length, diff });
    } else if (action === 'unpublish') {
      const before = await prisma.product.findMany({ where: { id: { in: ids } } });
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status: 'DRAFT' } as any });
      const diff = { status: { before: before.map(b=>({ id: b.id, status: (b as any).status })), after: 'DRAFT' } };
      await logAdminAction('product.update', { userId: session.user.id, bulk: true, action, count: ids.length, diff });
    }
    // Individual revalidation (simpler) – could batch later.
    for (const id of ids) {
      invalidateAfterProductMutation(id, { userId: session.user.id });
    }
    // delete action already logged earlier with cascade info. publish/unpublish now logged inline with diff above.
    return NextResponse.json({ ok: true, action, count: ids.length });
  } catch (e: any) {
    return NextResponse.json({ error: 'Bulk action failed', detail: e?.message || 'unknown' }, { status: 500 });
  }
}
