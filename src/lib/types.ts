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
  featured?: boolean;
  createdAt: string;
  variants?: Array<{
    id: string; // unique per product
    label: string; // e.g., size 40 / 41
    priceDiff?: number; // delta applied on top of base/sale price
    overridePrice?: number; // absolute price override (takes precedence over priceDiff)
    stock?: number; // optional stock count for variant
  }>;
}
