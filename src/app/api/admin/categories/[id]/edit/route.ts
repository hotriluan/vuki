import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';
import { invalidateAfterCategoryMutation } from '@/lib/invalidate';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return NextResponse.redirect('/auth/login');
  const form = await req.formData();
  const name = form.get('name') as string;
  const slug = form.get('slug') as string;
  if (!name || !slug) return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  // Nếu đổi slug kiểm tra trùng
  if (slug !== existing.slug) {
    const dup = await prisma.category.findUnique({ where: { slug } });
    if (dup) return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 400 });
  }
  const updated = await prisma.category.update({ where: { id: params.id }, data: { name, slug } });
  await logAdminAction('category.update', { categoryId: updated.id, userId: session.user.id });
  invalidateAfterCategoryMutation(updated.slug);
  return NextResponse.json({ ok: true, redirect: '/admin/categories' });
}
