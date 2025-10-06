import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { slugify, suggestUniqueProductSlug } from '@/lib/slug';
import { invalidateAfterProductMutation } from '@/lib/invalidate';
import { logAdminAction } from '@/lib/audit';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const source = await prisma.product.findUnique({
    where: { id: params.id },
    include: { variants: true, media: true, categories: true }
  });
  if (!source) return NextResponse.json({ error: 'Không tìm thấy sản phẩm gốc' }, { status: 404 });

  // Build base slug suggestion: original + '-copy'
  const baseSlug = slugify(source.slug + '-copy');
  const newSlug = await suggestUniqueProductSlug(baseSlug);
  const now = new Date();

  let created: any;
  await prisma.$transaction(async tx => {
    created = await tx.product.create({
      data: {
        name: source.name + ' (Copy)',
        slug: newSlug,
        description: source.description,
        price: source.price,
        salePrice: source.salePrice ?? null,
        featured: false,
        status: 'DRAFT',
        publishedAt: null,
        primaryImage: source.primaryImage,
  images: source.images as any,
        stock: source.stock,
        categories: source.categories.length ? { create: source.categories.map(c => ({ categoryId: c.categoryId })) } : undefined,
        variants: source.variants.length ? { create: source.variants.map(v => ({ label: v.label, stock: v.stock, priceDiff: v.priceDiff })) } : undefined,
        media: source.media.length ? { create: source.media.map(m => ({ url: m.url, alt: m.alt, type: m.type, position: m.position, isPrimary: m.isPrimary })) } : undefined
      }
    });
  });

  // Audit + invalidate
  await logAdminAction('product.duplicate' as any, { userId: session.user.id, sourceId: source.id, newId: created.id });
  invalidateAfterProductMutation(created.id, { userId: session.user.id });
  return NextResponse.json({ ok: true, id: created.id, slug: created.slug });
}
