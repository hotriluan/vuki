import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { invalidateAfterProductMutation } from '@/lib/invalidate';
import { slugify, suggestUniqueProductSlug } from '@/lib/slug';

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const form = await req.formData();
  const name = (form.get('name') as string || '').trim();
  let slug = (form.get('slug') as string || '').trim();
  if (!slug && name) slug = slugify(name);
  slug = slugify(slug);
  const description = form.get('description') as string;
  const price = parseInt(form.get('price') as string, 10);
  const categoryId = form.get('categoryId') as string;
  const status = (form.get('status') as string || 'DRAFT').trim();
  const featured = form.get('featured') === 'on'; // Checkbox value
  const images = (form.get('images') as string || '').split(',').map(s => s.trim()).filter(Boolean);
  const primaryImageAlt = (form.get('primaryImageAlt') as string || '').trim();
  // New variant JSON field
  let variantData: { label: string; stock: number; priceDiff?: number | null; overridePrice?: number | null }[] = [];
  const variantsJson = (form.get('variantsJson') as string || '').trim();
  if (variantsJson) {
    try {
      const parsed = JSON.parse(variantsJson);
      if (Array.isArray(parsed)) {
        variantData = parsed.map((v: any) => ({
          label: typeof v.label === 'string' ? v.label.trim() : '',
            stock: Number.isFinite(v.stock) ? Math.max(0, parseInt(String(v.stock), 10)) : 0,
            priceDiff: (v.priceDiff === null || v.priceDiff === undefined || v.priceDiff === '') ? null : (Number.isFinite(v.priceDiff) ? parseInt(String(v.priceDiff), 10) : null),
            overridePrice: (v.overridePrice === null || v.overridePrice === undefined || v.overridePrice === '') ? null : (Number.isFinite(v.overridePrice) ? parseInt(String(v.overridePrice), 10) : null)
        })).filter(v => v.label);
      }
    } catch {}
  }
  if (!name || !slug || !description || !price || !categoryId) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
  }
  if (!['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(status)) {
    return NextResponse.json({ error: 'Status không hợp lệ' }, { status: 400 });
  }
  // Pre-check slug uniqueness; if exists, auto-suggest an alternative
  const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (existing) {
    const suggestion = await suggestUniqueProductSlug(slug);
    return NextResponse.json({ error: 'Slug đã tồn tại', suggestedSlug: suggestion }, { status: 409 });
  }
  let created: any = null;
  try {
    const createData: any = {
      name, slug, description, price, images, status, featured,
      categories: { create: [{ categoryId }] },
      variants: variantData.length ? { create: variantData.map(v => ({ label: v.label!, stock: v.stock, priceDiff: v.priceDiff, overridePrice: v.overridePrice || undefined })) } : undefined
    };

    // Set publishedAt if creating as PUBLISHED
    if (status === 'PUBLISHED') {
      createData.publishedAt = new Date();
    }

    created = await prisma.product.create({ data: createData });
    // Optionally: store alt into first ProductMedia if later media system used
  } catch (e: any) {
    if (e?.code === 'P2002') {
      const suggestion = await suggestUniqueProductSlug(slug);
      return NextResponse.json({ error: 'Slug đã bị trùng (P2002).', suggestedSlug: suggestion }, { status: 409 });
    }
    return NextResponse.json({ error: 'Không thể tạo sản phẩm', detail: e?.message || 'unknown' }, { status: 500 });
  }
  // Invalidate caches + rebuild search (fire-and-forget)
  if (created) invalidateAfterProductMutation(created.id, { userId: session.user.id });
  return NextResponse.json({ ok: true, redirect: '/admin/products' });
}
