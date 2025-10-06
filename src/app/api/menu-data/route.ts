import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menuService';

// GET /api/menu-data - Get navigation data (categories, products)
export async function GET() {
  try {
    const menuData = await MenuService.getMenuData();
    
    return NextResponse.json({ 
      success: true, 
      data: menuData 
    });
  } catch (error) {
    console.error('Menu data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}