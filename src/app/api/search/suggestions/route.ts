import { NextRequest, NextResponse } from 'next/server';
import { mockProducts, mockCategories, mockBrands } from '../../../../data/mockData';

// Types
interface SearchSuggestion {
  id: string;
  name: string;
  type: 'product' | 'category' | 'brand';
  href: string;
  image?: string;
  price?: number;
  badge?: string;
}

interface SearchResult {
  suggestions: SearchSuggestion[];
  totalResults: number;
  query: string;
  searchTime: number;
}

// Convert mock data to search suggestions
const productSuggestions: SearchSuggestion[] = mockProducts.map(product => ({
  id: product.id,
  name: product.name,
  type: 'product' as const,
  href: product.href,
  image: product.image,
  price: product.price,
  badge: product.badge
}));

const categorySuggestions: SearchSuggestion[] = mockCategories.map(category => ({
  id: category.id,
  name: category.name,
  type: 'category' as const,
  href: category.href
}));

const brandSuggestions: SearchSuggestion[] = mockBrands.map(brand => ({
  id: brand.id,
  name: brand.name,
  type: 'brand' as const,
  href: brand.href
}));

// Combine all searchable items
const allItems: SearchSuggestion[] = [
  ...productSuggestions,
  ...categorySuggestions,
  ...brandSuggestions
];

// GET /api/search - Search for products, categories, and brands
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as 'product' | 'category' | 'brand' | null;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    // Filter items based on query
    let filteredItems = allItems.filter(item => 
      item.name.toLowerCase().includes(query)
    );

    // Filter by type if specified
    if (type) {
      filteredItems = filteredItems.filter(item => item.type === type);
    }

    // Sort by relevance (exact matches first, then starts with, then contains)
    filteredItems.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match
      if (aName === query && bName !== query) return -1;
      if (bName === query && aName !== query) return 1;
      
      // Starts with
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      
      // Alphabetical
      return aName.localeCompare(bName);
    });

    // Limit results
    const limitedResults = filteredItems.slice(0, limit);

    const searchTime = Date.now() - startTime;

    const result: SearchResult = {
      suggestions: limitedResults,
      totalResults: filteredItems.length,
      query: searchParams.get('q') || '',
      searchTime
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/search - Advanced search with filters
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { 
      query = '', 
      filters = {}, 
      sort = 'relevance',
      limit = 20,
      offset = 0
    } = body;

    if (!query?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    const queryLower = query.toLowerCase();

    // Filter items based on query
    let filteredItems = allItems.filter(item => 
      item.name.toLowerCase().includes(queryLower)
    );

    // Apply filters
    if (filters.type && Array.isArray(filters.type)) {
      filteredItems = filteredItems.filter(item => 
        filters.type.includes(item.type)
      );
    }

    if (filters.priceMin && filters.priceMax) {
      filteredItems = filteredItems.filter(item => 
        item.price && item.price >= filters.priceMin && item.price <= filters.priceMax
      );
    }

    if (filters.hasPrice !== undefined) {
      filteredItems = filteredItems.filter(item => 
        filters.hasPrice ? item.price !== undefined : item.price === undefined
      );
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        filteredItems.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        filteredItems.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        // Sort by relevance (as in GET method)
        filteredItems.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          if (aName === queryLower && bName !== queryLower) return -1;
          if (bName === queryLower && aName !== queryLower) return 1;
          if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
          if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;
          
          return aName.localeCompare(bName);
        });
        break;
    }

    // Apply pagination
    const paginatedResults = filteredItems.slice(offset, offset + limit);

    const searchTime = Date.now() - startTime;

    const result = {
      suggestions: paginatedResults,
      totalResults: filteredItems.length,
      query,
      searchTime,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < filteredItems.length
      },
      filters: filters,
      sort
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error performing advanced search:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}