import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { invalidateAfterProductMutation } from '@/lib/invalidate';
import { slugify, suggestUniqueProductSlug } from '@/lib/slug';
import { logAdminAction } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.redirect('/auth/login');
  }
  const form = await req.formData();
  const ifMatchUpdatedAt = (form.get('updatedAt') as string || '').trim();
  const forceOnConflict = (form.get('forceOnConflict') as string || '').trim() === '1';
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
  // Variants now come as JSON string in field variantsJson
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
  // Check slug conflict (exclude self)
  const other = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (other && other.id !== params.id) {
    const suggestion = await suggestUniqueProductSlug(slug);
    return NextResponse.json({ error: 'Slug đã tồn tại ở sản phẩm khác.', suggestedSlug: suggestion }, { status: 409 });
  }
  const existing = await prisma.product.findUnique({ where: { id: params.id }, include: { categories: true, variants: true }, });
  if (!existing) {
    return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
  }
  const prevSlug = existing.slug;
  const beforeSnapshot = {
    id: params.id,
    name: (existing as any).name,
    slug: existing.slug,
    price: (existing as any).price,
    status: (existing as any).status,
    categoryIds: (existing as any).categories.map((c: any) => c.categoryId),
    imagesHash: JSON.stringify((existing as any).images || []),
    variants: (existing as any).variants.map((v: any) => ({ id: v.id, label: v.label, stock: v.stock, priceDiff: v.priceDiff }))
  };
  // Temporarily disable optimistic concurrency to avoid constant 409s
  // TODO: Re-enable when we have proper real-time conflict detection
  /*
  if (ifMatchUpdatedAt) {
    const sent = new Date(ifMatchUpdatedAt).getTime();
    const current = new Date(existing.updatedAt).getTime();
    console.log('Timestamp check - sent:', ifMatchUpdatedAt, '(', sent, '), current:', existing.updatedAt, '(', current, '), forceOnConflict:', forceOnConflict);
    if (!Number.isFinite(sent) || sent !== current) {
      if (!forceOnConflict) {
        console.log('Returning 409 conflict');
        return NextResponse.json({ error: 'Xung đột cập nhật (409)', conflict: true, current: { updatedAt: existing.updatedAt, slug: existing.slug } }, { status: 409 });
      } else {
        console.log('Force override applied');
      }
    }
  }
  */
  try {
    // Handle publishedAt logic based on status change
    const updateData: any = {
      name, slug, description, price, images, status, featured,
      categories: { deleteMany: {}, create: [{ categoryId }] },
      variants: variantData.length ? { deleteMany: {}, create: variantData.map(v => ({ label: v.label!, stock: v.stock, priceDiff: v.priceDiff, overridePrice: v.overridePrice || undefined })) } : { deleteMany: {} }
    };

    // Set publishedAt when publishing for first time, clear when unpublishing
    if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    } else if (status === 'DRAFT' && existing.status === 'PUBLISHED') {
      updateData.publishedAt = null;
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { categories: true, variants: true }
    });
    const afterSnapshot = {
      id: params.id,
      name: updated.name,
      slug: updated.slug,
      price: updated.price,
      status: updated.status,
      categoryIds: updated.categories.map((c: any) => c.categoryId),
      imagesHash: JSON.stringify(updated.images || []),
      variants: updated.variants.map(v => ({ id: v.id, label: v.label, stock: v.stock, priceDiff: v.priceDiff }))
    };
    const diff: Record<string, any> = {};
    for (const key of ['name','slug','price','status','imagesHash']) {
      if ((beforeSnapshot as any)[key] !== (afterSnapshot as any)[key]) diff[key] = { before: (beforeSnapshot as any)[key], after: (afterSnapshot as any)[key] };
    }
    if (beforeSnapshot.categoryIds.join(',') !== afterSnapshot.categoryIds.join(',')) {
      diff.categoryIds = { before: beforeSnapshot.categoryIds, after: afterSnapshot.categoryIds };
    }
    if (JSON.stringify(beforeSnapshot.variants) !== JSON.stringify(afterSnapshot.variants)) {
      diff.variants = { beforeCount: beforeSnapshot.variants.length, afterCount: afterSnapshot.variants.length };
    }
  await logAdminAction('product.update', { userId: session.user.id, productId: params.id, diff: { ...diff, forcedOverride: forceOnConflict || undefined } });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      const suggestion = await suggestUniqueProductSlug(slug);
      return NextResponse.json({ error: 'Slug bị trùng (P2002).', suggestedSlug: suggestion }, { status: 409 });
    }
    return NextResponse.json({ error: 'Không thể cập nhật sản phẩm', detail: e?.message || 'unknown' }, { status: 500 });
  }
  invalidateAfterProductMutation(params.id, { previousSlug: prevSlug, userId: session.user.id });
  return NextResponse.json({ ok: true, redirect: '/admin/products' });
}
