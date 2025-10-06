import { useState, useEffect } from 'react';
import { Category, Product } from '@prisma/client';

export interface MenuData {
  categories: Category[];
  featuredProducts: Product[];
  topProducts: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export function useMenuData() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menu-data');
        const result: ApiResponse<MenuData> = await response.json();
        
        if (result.success) {
          setMenuData(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to fetch menu data');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching menu data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  return { menuData, loading, error };
}

export function useCategoriesWithProducts() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        const result: ApiResponse<any[]> = await response.json();
        
        if (result.success) {
          setCategories(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to fetch categories');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useProductSearch(query: string, enabled: boolean = true) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !query.trim()) {
      setProducts([]);
      return;
    }

    const searchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const result = await response.json();
        
        if (result.success || result.items) {
          setProducts(result.data || result.items || []);
          setError(null);
        } else {
          setError('Failed to search products');
        }
      } catch (err) {
        setError('Search failed');
        console.error('Error searching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query, enabled]);

  return { products, loading, error };
}