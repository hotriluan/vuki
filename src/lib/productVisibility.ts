// Centralized helpers for determining whether a product is publicly visible.
// Criteria: not soft-deleted AND (status = PUBLISHED OR (status = SCHEDULED and publishedAt <= now)).
// DRAFT products are never considered active for public/search surfaces.

import type { Prisma } from '@prisma/client';

// Returns a Prisma-compatible where fragment; pass `now` if you already computed once.
export function activeProductWhere(now: Date = new Date()): Prisma.ProductWhereInput {
  // We need (status = PUBLISHED) OR (status = SCHEDULED and publishedAt <= now).
  // Prisma expects enum values from ProductStatus, so we cast accordingly.
  const fragment = {
    deletedAt: null,
    OR: [
      { status: 'PUBLISHED' as any },
      { status: 'SCHEDULED' as any, publishedAt: { lte: now } }
    ]
  } as unknown as Prisma.ProductWhereInput;
  return fragment;
}

// Type guard / predicate for already-fetched plain objects (e.g., after combining sources)
export function isProductActive(p: any, now: Date = new Date()): boolean {
  if (!p || p.deletedAt) return false;
  if (p.status === 'PUBLISHED') return true;
  if (p.status === 'SCHEDULED' && p.publishedAt && new Date(p.publishedAt) <= now) return true;
  return false;
}

// Utility to filter an array of product-like objects in memory
export function filterActiveProducts<T>(products: T[], now: Date = new Date()): T[] {
  return products.filter(p => isProductActive(p as any, now));
}
