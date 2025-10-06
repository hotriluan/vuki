// Mock data for testing
export const mockProducts = [
  {
    id: 'p-1',
    slug: 'urban-runner-white',
    name: 'Urban Runner White',
    description: 'Lightweight everyday sneaker with breathable mesh and cushioned sole.',
    price: 1590000,
    salePrice: 1290000,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    categoryIds: ['c-sneakers'],
    featured: true,
    variants: [
      { id: 'sz-39', label: 'Size 39', stock: 10, priceDiff: 0 },
      { id: 'sz-40', label: 'Size 40', stock: 8, priceDiff: 20000 },
      { id: 'sz-41', label: 'Size 41', stock: 5, priceDiff: 25000 },
    ]
  },
  {
    id: 'p-2',
    slug: 'casual-canvas-blue',
    name: 'Casual Canvas Blue', 
    description: 'Classic canvas sneaker in vibrant blue with rubber sole.',
    price: 990000,
    salePrice: 790000,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
    categoryIds: ['c-sneakers'],
    featured: false,
    variants: [
      { id: 'sz-40-blue', label: 'Size 40', stock: 15, priceDiff: 0 },
      { id: 'sz-41-blue', label: 'Size 41', stock: 12, priceDiff: 0 },
    ]
  },
  {
    id: 'p-3',
    slug: 'premium-leather-boots',
    name: 'Premium Leather Boots',
    description: 'High-quality leather boots for all occasions.',
    price: 2590000,
    salePrice: null,
    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=500'],
    categoryIds: ['c-boots'],
    featured: true,
    variants: []
  },
  {
    id: 'p-4',
    slug: 'budget-sneaker',
    name: 'Budget Sneaker',
    description: 'Affordable sneaker for everyday wear.',
    price: 99000,
    salePrice: 79000,
    images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500'],
    categoryIds: ['c-sneakers'],
    featured: false,
    variants: []
  }
];

export const mockCategories = [
  { id: 'c-sneakers', name: 'Sneakers', slug: 'sneakers' },
  { id: 'c-boots', name: 'Boots', slug: 'boots' },
  { id: 'c-accessories', name: 'Accessories', slug: 'accessories' },
  { id: 'c-limited', name: 'Limited', slug: 'limited' }
];