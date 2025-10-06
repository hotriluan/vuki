import { NextRequest, NextResponse } from 'next/server';

// Types
interface MenuItem {
  id: string;
  name: string;
  href: string;
  badge?: string;
  visible: boolean;
  order: number;
  megaMenu?: {
    enabled: boolean;
    featured: Array<{
      id: string;
      name: string;
      price: number;
      href: string;
      badge?: string;
      image?: string;
    }>;
    categories: Array<{
      id: string;
      name: string;
      href: string;
      icon?: string;
    }>;
    brands: Array<{
      id: string;
      name: string;
      href: string;
    }>;
  };
}

// Mock database - In production, this would be a real database
let menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Sneakers',
    href: '/category/sneakers',
    visible: true,
    order: 1,
    megaMenu: {
      enabled: true,
      featured: [
        {
          id: 'f1',
          name: 'Nike Air Max 270',
          price: 2500000,
          href: '/product/nike-air-max-270',
          badge: 'HOT',
          image: '/images/featured/nike-air-max-270.jpg'
        },
        {
          id: 'f2',
          name: 'Adidas Ultraboost 22',
          price: 2800000,
          href: '/product/adidas-ultraboost-22',
          badge: 'NEW',
          image: '/images/featured/adidas-ultraboost-22.jpg'
        }
      ],
      categories: [
        { id: 'c1', name: 'Running', href: '/category/sneakers?type=running', icon: '🏃‍♂️' },
        { id: 'c2', name: 'Basketball', href: '/category/sneakers?type=basketball', icon: '🏀' },
        { id: 'c3', name: 'Lifestyle', href: '/category/sneakers?type=lifestyle', icon: '👟' },
        { id: 'c4', name: 'Training', href: '/category/sneakers?type=training', icon: '💪' }
      ],
      brands: [
        { id: 'b1', name: 'Nike', href: '/brand/nike' },
        { id: 'b2', name: 'Adidas', href: '/brand/adidas' },
        { id: 'b3', name: 'Puma', href: '/brand/puma' },
        { id: 'b4', name: 'New Balance', href: '/brand/new-balance' }
      ]
    }
  },
  {
    id: '2',
    name: 'Boots',
    href: '/category/boots',
    visible: true,
    order: 2,
    megaMenu: {
      enabled: true,
      featured: [
        {
          id: 'f3',
          name: 'Timberland 6-Inch Premium',
          price: 4200000,
          href: '/product/timberland-6-inch-premium',
          badge: 'BESTSELLER',
          image: '/images/featured/timberland-premium.jpg'
        }
      ],
      categories: [
        { id: 'c5', name: 'Work Boots', href: '/category/boots?type=work', icon: '👷‍♂️' },
        { id: 'c6', name: 'Fashion Boots', href: '/category/boots?type=fashion', icon: '👢' },
        { id: 'c7', name: 'Hiking Boots', href: '/category/boots?type=hiking', icon: '🥾' }
      ],
      brands: [
        { id: 'b5', name: 'Timberland', href: '/brand/timberland' },
        { id: 'b6', name: 'Dr. Martens', href: '/brand/dr-martens' },
        { id: 'b7', name: 'Red Wing', href: '/brand/red-wing' }
      ]
    }
  },
  {
    id: '3',
    name: 'Accessories',
    href: '/category/accessories',
    visible: true,
    order: 3
  },
  {
    id: '4',
    name: 'Sale',
    href: '/sale',
    badge: 'HOT',
    visible: true,
    order: 4
  }
];

// GET /api/menu - Get all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get('includeHidden') === 'true';
    
    let filteredItems = includeHidden 
      ? menuItems 
      : menuItems.filter(item => item.visible);
    
    // Sort by order
    filteredItems.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      success: true,
      data: filteredItems,
      total: filteredItems.length
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/menu - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.name || !body.href) {
      return NextResponse.json(
        { success: false, error: 'Name and href are required' },
        { status: 400 }
      );
    }

    // Check if href already exists
    if (menuItems.some(item => item.href === body.href)) {
      return NextResponse.json(
        { success: false, error: 'Menu item with this href already exists' },
        { status: 409 }
      );
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: body.name,
      href: body.href,
      badge: body.badge,
      visible: body.visible ?? true,
      order: body.order ?? menuItems.length + 1,
      megaMenu: body.megaMenu
    };

    menuItems.push(newItem);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Menu item created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/menu - Update menu items order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Update order for all items
    body.items.forEach((item: { id: string; order: number }) => {
      const menuItem = menuItems.find(m => m.id === item.id);
      if (menuItem) {
        menuItem.order = item.order;
      }
    });

    // Sort items by order
    menuItems.sort((a, b) => a.order - b.order);

    return NextResponse.json({
      success: true,
      data: menuItems,
      message: 'Menu order updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}