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

// Mock database - same as parent route
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
        }
      ],
      categories: [
        { id: 'c1', name: 'Running', href: '/category/sneakers?type=running', icon: '🏃‍♂️' }
      ],
      brands: [
        { id: 'b1', name: 'Nike', href: '/brand/nike' }
      ]
    }
  }
];

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/menu/[id] - Get specific menu item
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const menuItem = menuItems.find(item => item.id === params.id);
    
    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/menu/[id] - Update specific menu item
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const menuItemIndex = menuItems.findIndex(item => item.id === params.id);
    
    if (menuItemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!body.name || !body.href) {
      return NextResponse.json(
        { success: false, error: 'Name and href are required' },
        { status: 400 }
      );
    }

    // Check if href already exists (excluding current item)
    if (menuItems.some(item => item.href === body.href && item.id !== params.id)) {
      return NextResponse.json(
        { success: false, error: 'Menu item with this href already exists' },
        { status: 409 }
      );
    }

    // Update menu item
    menuItems[menuItemIndex] = {
      ...menuItems[menuItemIndex],
      name: body.name,
      href: body.href,
      badge: body.badge,
      visible: body.visible ?? menuItems[menuItemIndex].visible,
      megaMenu: body.megaMenu
    };

    return NextResponse.json({
      success: true,
      data: menuItems[menuItemIndex],
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/[id] - Delete specific menu item
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const menuItemIndex = menuItems.findIndex(item => item.id === params.id);
    
    if (menuItemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Remove menu item
    const deletedItem = menuItems.splice(menuItemIndex, 1)[0];

    // Reorder remaining items
    menuItems.forEach((item, index) => {
      item.order = index + 1;
    });

    return NextResponse.json({
      success: true,
      data: deletedItem,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/menu/[id] - Toggle visibility or partial update
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await request.json();
    const menuItemIndex = menuItems.findIndex(item => item.id === params.id);
    
    if (menuItemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Update only provided fields
    if (body.hasOwnProperty('visible')) {
      menuItems[menuItemIndex].visible = body.visible;
    }
    
    if (body.hasOwnProperty('order')) {
      menuItems[menuItemIndex].order = body.order;
    }

    if (body.hasOwnProperty('badge')) {
      menuItems[menuItemIndex].badge = body.badge;
    }

    return NextResponse.json({
      success: true,
      data: menuItems[menuItemIndex],
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}