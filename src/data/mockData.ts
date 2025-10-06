// Mock data for testing components

export const mockProducts = [
  {
    id: '1',
    name: 'Nike Air Max 270 React',
    price: 2890000,
    originalPrice: 3200000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    href: '/products/nike-air-max-270-react',
    badge: 'HOT',
    rating: 4.5,
    reviews: 128,
    category: 'Sneakers',
    brand: 'Nike',
    inStock: true
  },
  {
    id: '2',
    name: 'Adidas Ultraboost 22',
    price: 3200000,
    originalPrice: 3500000,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
    href: '/products/adidas-ultraboost-22',
    badge: 'NEW',
    rating: 4.7,
    reviews: 89,
    category: 'Sneakers',
    brand: 'Adidas',
    inStock: true
  },
  {
    id: '3',
    name: 'Timberland 6-Inch Premium Boot',
    price: 4500000,
    originalPrice: 5000000,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
    href: '/products/timberland-6-inch-premium',
    badge: 'BESTSELLER',
    rating: 4.8,
    reviews: 203,
    category: 'Boots',
    brand: 'Timberland',
    inStock: true
  },
  {
    id: '4',
    name: 'Converse Chuck Taylor All Star',
    price: 1890000,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop',
    href: '/products/converse-chuck-taylor',
    rating: 4.3,
    reviews: 156,
    category: 'Sneakers',
    brand: 'Converse',
    inStock: true
  },
  {
    id: '5',
    name: 'Vans Old Skool',
    price: 2100000,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop',
    href: '/products/vans-old-skool',
    rating: 4.4,
    reviews: 92,
    category: 'Sneakers',
    brand: 'Vans',
    inStock: false
  },
  {
    id: '6',
    name: 'Dr. Martens 1460 Original',
    price: 3800000,
    image: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=400&h=400&fit=crop',
    href: '/products/dr-martens-1460',
    rating: 4.6,
    reviews: 174,
    category: 'Boots',
    brand: 'Dr. Martens',
    inStock: true
  }
];

export const mockCategories = [
  {
    id: 'sneakers',
    name: 'Sneakers',
    href: '/category/sneakers',
    icon: '👟',
    description: 'Giày thể thao thời trang',
    productCount: 156,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=400&fit=crop'
  },
  {
    id: 'boots',
    name: 'Boots',
    href: '/category/boots',
    icon: '🥾',
    description: 'Giày bốt chất lượng cao',
    productCount: 89,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=400&fit=crop'
  },
  {
    id: 'sandals',
    name: 'Sandals',
    href: '/category/sandals',
    icon: '👡',
    description: 'Dép sandal thoải mái',
    productCount: 67,
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    href: '/category/accessories',
    icon: '🎒',
    description: 'Phụ kiện thời trang',
    productCount: 234,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop'
  }
];

export const mockBrands = [
  {
    id: 'nike',
    name: 'Nike',
    href: '/brand/nike',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
    description: 'Just Do It',
    productCount: 89
  },
  {
    id: 'adidas',
    name: 'Adidas',
    href: '/brand/adidas',
    logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
    description: 'Impossible is Nothing',
    productCount: 76
  },
  {
    id: 'timberland',
    name: 'Timberland',
    href: '/brand/timberland',
    logo: 'https://logos-world.net/wp-content/uploads/2020/09/Timberland-Logo.png',
    description: 'Built for the Bold',
    productCount: 45
  },
  {
    id: 'converse',
    name: 'Converse',
    href: '/brand/converse',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/Converse-Logo.png',
    description: 'Create Next',
    productCount: 34
  },
  {
    id: 'vans',
    name: 'Vans',
    href: '/brand/vans',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/Vans-Logo.png',
    description: 'Off The Wall',
    productCount: 28
  },
  {
    id: 'dr-martens',
    name: 'Dr. Martens',
    href: '/brand/dr-martens',
    logo: 'https://logos-world.net/wp-content/uploads/2020/12/Dr-Martens-Logo.png',
    description: 'Stand for Something',
    productCount: 23
  }
];

export const mockCartItems = [
  {
    id: '1',
    productId: '1',
    name: 'Nike Air Max 270 React',
    price: 2890000,
    originalPrice: 3200000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
    variant: 'Size: 42, Color: Black/White',
    href: '/products/nike-air-max-270-react'
  },
  {
    id: '2',
    productId: '3',
    name: 'Timberland 6-Inch Premium Boot',
    price: 4500000,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop',
    variant: 'Size: 41, Color: Wheat',
    href: '/products/timberland-6-inch-premium'
  }
];

export const mockWishlistItems = [
  {
    id: '1',
    productId: '2',
    name: 'Adidas Ultraboost 22',
    price: 3200000,
    originalPrice: 3500000,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100&h=100&fit=crop',
    href: '/products/adidas-ultraboost-22',
    addedDate: '2024-10-01'
  },
  {
    id: '2',
    productId: '6',
    name: 'Dr. Martens 1460 Original',
    price: 3800000,
    image: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=100&h=100&fit=crop',
    href: '/products/dr-martens-1460',
    addedDate: '2024-09-28'
  }
];

export const mockUserData = {
  isLoggedIn: true,
  user: {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    phone: '0901234567',
    joinDate: '2023-05-15',
    totalOrders: 12,
    totalSpent: 28500000
  }
};

export const mockSearchSuggestions = [
  { id: '1', name: 'Nike Air Max 270', type: 'product' as const, href: '/products/nike-air-max-270', price: 2890000 },
  { id: '2', name: 'Nike Air Force 1', type: 'product' as const, href: '/products/nike-air-force-1', price: 2690000 },
  { id: '3', name: 'Nike React', type: 'product' as const, href: '/products/nike-react', price: 3100000 },
  { id: '4', name: 'Sneakers', type: 'category' as const, href: '/category/sneakers' },
  { id: '5', name: 'Nike', type: 'brand' as const, href: '/brand/nike' },
  { id: '6', name: 'Adidas Ultraboost', type: 'product' as const, href: '/products/adidas-ultraboost', price: 3200000 },
  { id: '7', name: 'Boots', type: 'category' as const, href: '/category/boots' },
];

export const mockMenuNavigation = [
  { 
    name: 'Sneakers', 
    href: '/category/sneakers',
    megaMenu: {
      enabled: true,
      featured: mockProducts.filter(p => p.category === 'Sneakers').slice(0, 2),
      categories: [
        { name: 'Running', href: '/category/sneakers?type=running', icon: '🏃‍♂️' },
        { name: 'Basketball', href: '/category/sneakers?type=basketball', icon: '🏀' },
        { name: 'Lifestyle', href: '/category/sneakers?type=lifestyle', icon: '👟' },
        { name: 'Training', href: '/category/sneakers?type=training', icon: '💪' }
      ],
      brands: mockBrands.filter(b => ['nike', 'adidas', 'converse', 'vans'].includes(b.id))
    }
  },
  { 
    name: 'Boots', 
    href: '/category/boots',
    megaMenu: {
      enabled: true,
      featured: mockProducts.filter(p => p.category === 'Boots').slice(0, 2),
      categories: [
        { name: 'Work Boots', href: '/category/boots?type=work', icon: '👷‍♂️' },
        { name: 'Fashion Boots', href: '/category/boots?type=fashion', icon: '👢' },
        { name: 'Hiking Boots', href: '/category/boots?type=hiking', icon: '🥾' }
      ],
      brands: mockBrands.filter(b => ['timberland', 'dr-martens'].includes(b.id))
    }
  },
  { 
    name: 'Accessories', 
    href: '/category/accessories'
  },
  { 
    name: 'Sale', 
    href: '/sale',
    badge: 'HOT'
  }
];

export const mockRecentlyViewed = [
  mockProducts[0],
  mockProducts[2],
  mockProducts[4]
];

export const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-09-25',
    status: 'delivered',
    total: 7390000,
    items: [
      { ...mockProducts[0], quantity: 1 },
      { ...mockProducts[2], quantity: 1 }
    ]
  },
  {
    id: 'ORD-002',
    date: '2024-09-15',
    status: 'shipping',
    total: 3200000,
    items: [
      { ...mockProducts[1], quantity: 1 }
    ]
  }
];