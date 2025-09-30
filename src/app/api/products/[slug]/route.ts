import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[slug]
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { categories: { include: { category: true } }, variants: true }
    });
    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice,
      featured: product.featured,
      images: product.images,
  categories: product.categories.map((pc: any) => pc.category.slug),
  variants: product.variants.map((v: any) => ({ id: v.id, label: v.label, stock: v.stock, priceDiff: v.priceDiff }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch product', detail: e.message }, { status: 500 });
  }
}
