import { Product } from './types';

export interface ProductFilterOptions {
  sort?: 'newest' | 'price-asc' | 'price-desc';
  min?: number;
  max?: number; // 0 or undefined = no cap
  sizes?: string[]; // variant ids
}

function effectivePrice(p: Product): number {
  return p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
}

export function filterAndSortProducts(list: Product[], opts: ProductFilterOptions): Product[] {
  const { sort = 'newest', min = 0, max = 0, sizes } = opts;
  let res = [...list];
  if (min && min > 0) res = res.filter(p => effectivePrice(p) >= min);
  if (max && max > 0) res = res.filter(p => effectivePrice(p) <= max);
  if (sizes && sizes.length > 0) {
    res = res.filter(p => {
      if (!p.variants || p.variants.length === 0) return false;
      return p.variants.some(v => sizes.includes(v.id));
    });
  }
  switch (sort) {
    case 'price-asc':
      res.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case 'price-desc':
      res.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    case 'newest':
    default:
      res.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
  return res;
}
