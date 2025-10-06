import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';
import { invalidateAfterProductMutation } from '@/lib/invalidate';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  // Soft delete: set deletedAt if not already deleted
  const existing = await (prisma.product as any).findUnique({ where: { id }, select: { id: true, deletedAt: true } });
  if (!existing) {
    return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
  }
  if (existing.deletedAt) {
    return NextResponse.json({ ok: true, alreadyDeleted: true });
  }
  // Hard cascade variants (Task 9 hard): when a product is soft deleted we physically remove its variants.
  const now = new Date();
  const [, variantDeletion] = await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { deletedAt: now } }),
    prisma.productVariant.deleteMany({ where: { productId: id } })
  ]);
  await logAdminAction('product.delete', {
    productId: id,
    userId: session.user.id,
    variantCascadeDeletedCount: variantDeletion.count
  });
  invalidateAfterProductMutation(id, { userId: session.user.id });
  return NextResponse.json({ ok: true, redirect: '/admin/products' });
}
