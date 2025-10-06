import { Category, Product } from '@prisma/client';

export interface NavigationItem {
  name: string;
  href: string;
  badge?: string;
  megaMenu?: {
    enabled: boolean;
    featured: Array<{
      name: string;
      price: number;
      href: string;
      badge?: string;
      image: string; // required, no undefined
    }>;
    categories: Array<{
      name: string;
      href: string;
      icon?: string;
    }>;
    brands: Array<{
      name: string;
      href: string;
    }>;
  };
}

// Mapping categories to icons (có thể customize sau)
const categoryIcons: Record<string, string> = {
  'sneakers': '👟',
  'boots': '🥾', 
  'accessories': '🎒',
  'limited': '⭐',
  'running': '🏃‍♂️',
  'basketball': '🏀',
  'lifestyle': '👟',
  'training': '💪'
};

export function transformMenuData(
  categories: Category[], 
  featuredProducts: Product[]
): NavigationItem[] {
  return categories.map(category => {
    // Lấy featured products cho category này (giả sử có 2-3 products per category)
    const categoryProducts = featuredProducts
      .filter(product => 
        // Tạm thời sử dụng logic đơn giản, có thể cải thiện sau
        product.name.toLowerCase().includes(category.name.toLowerCase()) ||
        category.name.toLowerCase() === 'sneakers' || 
        category.name.toLowerCase() === 'boots'
      )
      .slice(0, 3)
      .map(product => ({
        name: product.name,
        price: product.price,
        href: `/product/${product.slug}`,
        badge: product.featured ? 'HOT' : undefined,
        image: product.primaryImage || '/images/placeholder.jpg'
      }));

    // Tạo sub-categories (có thể customize cho từng category)
    const subCategories = getSubCategoriesForCategory(category.name);

    return {
      name: category.name,
      href: `/category/${category.slug}`,
      megaMenu: {
        enabled: true,
        featured: categoryProducts,
        categories: subCategories,
        brands: getDefaultBrands() // Có thể fetch từ database sau
      }
    };
  });
}

function getSubCategoriesForCategory(categoryName: string) {
  const subcategoryMap: Record<string, Array<{name: string, href: string, icon?: string}>> = {
    'Sneakers': [
      { name: 'Running', href: '/category/sneakers?type=running', icon: '🏃‍♂️' },
      { name: 'Basketball', href: '/category/sneakers?type=basketball', icon: '🏀' },
      { name: 'Lifestyle', href: '/category/sneakers?type=lifestyle', icon: '👟' },
      { name: 'Training', href: '/category/sneakers?type=training', icon: '💪' }
    ],
    'Boots': [
      { name: 'Work Boots', href: '/category/boots?type=work', icon: '👷‍♂️' },
      { name: 'Fashion Boots', href: '/category/boots?type=fashion', icon: '👢' },
      { name: 'Hiking Boots', href: '/category/boots?type=hiking', icon: '🥾' }
    ],
    'Accessories': [
      { name: 'Socks', href: '/category/accessories?type=socks', icon: '🧦' },
      { name: 'Bags', href: '/category/accessories?type=bags', icon: '🎒' },
      { name: 'Care Products', href: '/category/accessories?type=care', icon: '🧴' }
    ],
    'Limited': [
      { name: 'Exclusive', href: '/category/limited?type=exclusive', icon: '⭐' },
      { name: 'Collaboration', href: '/category/limited?type=collab', icon: '🤝' },
      { name: 'Vintage', href: '/category/limited?type=vintage', icon: '🕰️' }
    ]
  };

  return subcategoryMap[categoryName] || [
    { name: 'All', href: `/category/${categoryName.toLowerCase()}`, icon: categoryIcons[categoryName.toLowerCase()] || '📦' }
  ];
}

function getDefaultBrands() {
  return [
    { name: 'Nike', href: '/brand/nike' },
    { name: 'Adidas', href: '/brand/adidas' },
    { name: 'Puma', href: '/brand/puma' },
    { name: 'New Balance', href: '/brand/new-balance' },
    { name: 'Timberland', href: '/brand/timberland' },
    { name: 'Dr. Martens', href: '/brand/dr-martens' }
  ];
}