// JS runtime version of productVisibility helpers (avoid TS import issues in raw node scripts)
export function activeProductWhere(now = new Date()) {
  return {
    deletedAt: null,
    OR: [
      { status: 'PUBLISHED' },
      { status: 'SCHEDULED', publishedAt: { lte: now } }
    ]
  };
}

export function isProductActive(p, now = new Date()) {
  if (!p || p.deletedAt) return false;
  if (p.status === 'PUBLISHED') return true;
  if (p.status === 'SCHEDULED' && p.publishedAt && new Date(p.publishedAt) <= now) return true;
  return false;
}

export function filterActiveProducts(products, now = new Date()) {
  return products.filter(p => isProductActive(p, now));
}
