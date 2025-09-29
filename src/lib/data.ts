import { Category, Product } from './types';

export const categories: Category[] = [
  { id: 'c-sneakers', name: 'Sneakers', slug: 'sneakers' },
  { id: 'c-boots', name: 'Boots', slug: 'boots' },
  { id: 'c-accessories', name: 'Accessories', slug: 'accessories' },
  { id: 'c-limited', name: 'Limited', slug: 'limited' }
];

export const products: Product[] = [
  {
    id: 'p-1',
    name: 'Urban Runner White',
    slug: 'urban-runner-white',
    description: 'Lightweight everyday sneaker with breathable mesh and cushioned sole.',
    price: 1590000,
    salePrice: 1290000,
    categoryIds: ['c-sneakers'],
  images: ['https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=800&q=60'],
    featured: true,
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'sz-39', label: 'Size 39', stock: 10 },
      { id: 'sz-40', label: 'Size 40', stock: 8 },
      { id: 'sz-41', label: 'Size 41', stock: 5, priceDiff: 20_000 },
      { id: 'sz-42', label: 'Size 42', stock: 0, priceDiff: 20_000 }
    ]
  },
  {
    id: 'p-2',
    name: 'Trail Explorer',
    slug: 'trail-explorer',
    description: 'Durable outdoor shoe designed for mixed terrain with reinforced toe.',
    price: 1890000,
    salePrice: 1590000,
    categoryIds: ['c-boots'],
    images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=60'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-3',
    name: 'Minimalist Leather Boot',
    slug: 'minimalist-leather-boot',
    description: 'Premium full-grain leather boot with clean lines and stitched sole.',
    price: 2350000,
    categoryIds: ['c-boots'],
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=60'],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'p-4',
    name: 'Performance Sock',
    slug: 'performance-sock',
    description: 'Moisture-wicking breathable sock engineered for comfort.',
    price: 99000,
    salePrice: 79000,
    categoryIds: ['c-accessories'],
    images: ['https://images.unsplash.com/photo-1600180758890-c8d3a5d35a5d?auto=format&fit=crop&w=800&q=60'],
    createdAt: new Date().toISOString()
  }
];

export function findProductBySlug(slug: string) {
  return products.find(p => p.slug === slug);
}

export function findCategoryBySlug(slug: string) {
  return categories.find(c => c.slug === slug);
}

export function productsByCategorySlug(slug: string) {
  const category = findCategoryBySlug(slug);
  if (!category) return [];
  return products.filter(p => p.categoryIds.includes(category.id));
}

export function findProductById(id: string) {
  return products.find(p => p.id === id);
}
