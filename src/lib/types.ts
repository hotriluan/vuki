export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // original price
  salePrice?: number; // discounted price
  categoryIds: string[];
  images: string[];
  primaryImage?: string | null;
  featured?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt?: string | null; // ISO date when product is (or will be) publicly visible
  createdAt: string;
  variants?: Array<{
    id: string; // unique per product
    label: string; // e.g., size 40 / 41
    priceDiff?: number; // delta applied on top of base/sale price
    overridePrice?: number; // absolute price override (takes precedence over priceDiff)
    stock?: number; // optional stock count for variant
  }>;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1-5
  title?: string;
  body: string;
  createdAt: string; // ISO date
}

export interface AggregatedRating {
  productId: string;
  average: number;
  count: number;
}
