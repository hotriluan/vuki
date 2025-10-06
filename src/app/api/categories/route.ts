import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/services/menuService';

// GET /api/categories - Get categories with products
export async function GET() {
  try {
    const categories = await MenuService.getCategoriesWithProducts();
    
    return NextResponse.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}