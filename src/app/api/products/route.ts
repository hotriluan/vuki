import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activeProductWhere } from '@/lib/productVisibility';

// GET /api/products?category=slug&page=1&limit=12
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get('category') || undefined;
  const idsParam = searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : undefined;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
  const skip = (page - 1) * limit;

  const now = new Date();
  let where: any = activeProductWhere(now);
  if (categorySlug) {
    where = { ...where, categories: { some: { category: { slug: categorySlug } } } };
  }
  if (ids && ids.length) {
    where = { ...where, id: { in: ids } };
  }

  try {
    const [items, total] = await Promise.all([
      (prisma as any).product.findMany({
        where,
        include: { categories: { include: { category: true } }, variants: true, media: { orderBy: { position: 'asc' } } },
        orderBy: { createdAt: 'desc' },
        skip: ids ? 0 : skip,
        take: ids ? 250 : limit,
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
  // Using any temporarily; after running prisma generate we can import proper types.
  items: items.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        featured: p.featured,
        images: p.images,
    primaryImage: p.primaryImage || (p.media?.find((m: any) => m.isPrimary)?.url) || (Array.isArray(p.images) ? p.images[0] : null),
        categories: p.categories.map((pc: any) => pc.category.slug),
        variants: p.variants.map((v: any) => ({ id: v.id, label: v.label, stock: v.stock, priceDiff: v.priceDiff }))
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch products', detail: e.message }, { status: 500 });
  }
}
