import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';
import { invalidateAfterCategoryMutation } from '@/lib/invalidate';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  // Xoá: trước tiên xoá các liên kết
  await prisma.$transaction([
    prisma.productCategory.deleteMany({ where: { categoryId: params.id } }),
    prisma.category.delete({ where: { id: params.id } })
  ]);
  await logAdminAction('category.delete', { categoryId: params.id, userId: session.user.id });
  if (existing.slug) invalidateAfterCategoryMutation(existing.slug);
  return NextResponse.json({ ok: true, redirect: '/admin/categories' });
}
