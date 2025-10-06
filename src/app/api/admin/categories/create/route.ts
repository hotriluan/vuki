import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const name = form.get('name') as string;
  const slug = form.get('slug') as string;
  if (!name || !slug) return NextResponse.json({ error: 'Thiếu dữ liệu' }, { status: 400 });
  const exists = await prisma.category.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 400 });
  const cat = await prisma.category.create({ data: { name, slug } });
  await logAdminAction('category.create', { categoryId: cat.id, userId: session.user.id });
  // Invalidate sitemap & category list pages (homepage if it lists categories)
  try {
    revalidatePath('/category/' + slug);
    revalidatePath('/sitemap.xml');
  } catch {}
  return NextResponse.json({ ok: true, redirect: '/admin/categories', id: cat.id });
}
