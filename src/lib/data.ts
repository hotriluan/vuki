import { prisma } from '@/lib/prisma';
import { activeProductWhere } from './productVisibility';
import type { Category, Product } from './types';

// Public-facing helpers must exclude soft-deleted products (deletedAt NOT NULL)
// Admin area should explicitly include deleted items if needed.

export async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany();
}

export async function getProducts(): Promise<Product[]> {
  // Only return non-deleted and published (or scheduled already active) products
  const now = new Date();
    return (prisma as any).product.findMany({
      where: activeProductWhere(now),
       include: { categories: true, variants: true, media: { orderBy: { position: 'asc' } } }
    }).then((rows: any[]) => rows.map(r => ({
      ...r,
      primaryImage: r.primaryImage || (r.media?.find((m: any) => m.isPrimary)?.url) || (Array.isArray(r.images) ? r.images[0] : null)
    }))) as any;
}

export async function findProductBySlug(slug: string) {
  const now = new Date();
    return (prisma as any).product.findFirst({
      where: { ...activeProductWhere(now), slug },
      include: { categories: true, variants: true, media: { orderBy: { position: 'asc' } } }
    }).then((r: any) => r && {
      ...r,
      primaryImage: r.primaryImage || (r.media?.find((m: any) => m.isPrimary)?.url) || (Array.isArray(r.images) ? r.images[0] : null)
    }) as any;
}

export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function productsByCategorySlug(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return [];
  const now = new Date();
    return (prisma as any).product.findMany({
      where: { ...activeProductWhere(now), categories: { some: { categoryId: category.id } } },
      include: { categories: true, variants: true, media: { orderBy: { position: 'asc' } } }
    }).then((rows: any[]) => rows.map(r => ({
      ...r,
      primaryImage: r.primaryImage || (r.media?.find((m: any) => m.isPrimary)?.url) || (Array.isArray(r.images) ? r.images[0] : null)
    }))) as any;
}

export async function findProductById(id: string) {
  const now = new Date();
    return (prisma as any).product.findFirst({
      where: { ...activeProductWhere(now), id },
      include: { categories: true, variants: true, media: { orderBy: { position: 'asc' } } }
    }).then((r: any) => r && {
      ...r,
      primaryImage: r.primaryImage || (r.media?.find((m: any) => m.isPrimary)?.url) || (Array.isArray(r.images) ? r.images[0] : null)
    }) as any;
}

// Explicit helper for admin to fetch even soft-deleted if necessary
export async function adminFindProductById(id: string) {
  return prisma.product.findUnique({ where: { id }, include: { categories: true, variants: true } }) as any;
}

export async function adminListAllProducts() {
  return prisma.product.findMany({ include: { categories: true, variants: true } }) as any;
}
