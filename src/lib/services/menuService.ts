import { prisma } from '../prisma';
import { Category, Product } from '@prisma/client';

export interface MenuData {
  categories: Category[];
  featuredProducts: Product[];
  topProducts: Product[];
}

export class MenuService {
  /**
   * Lấy tất cả dữ liệu cần thiết cho menu navigation
   */
  static async getMenuData(): Promise<MenuData> {
    try {
      // Lấy tất cả categories
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });

      // Lấy featured products (giới hạn 6)
      const featuredProducts = await prisma.product.findMany({
        where: {
          featured: true,
          status: 'PUBLISHED',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      });

      // Lấy top products theo ngày tạo (giới hạn 8)
      const topProducts = await prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      });

      return {
        categories,
        featuredProducts,
        topProducts,
      };
    } catch (error) {
      console.error('Error fetching menu data:', error);
      throw new Error('Failed to fetch menu data');
    }
  }

  /**
   * Lấy categories với products liên quan
   */
  static async getCategoriesWithProducts() {
    try {
      return await prisma.category.findMany({
        include: {
          products: {
            where: {
              product: {
                status: 'PUBLISHED',
                deletedAt: null,
              },
            },
            include: {
              product: true,
            },
            take: 4, // Giới hạn 4 products per category
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching categories with products:', error);
      throw new Error('Failed to fetch categories with products');
    }
  }

  /**
   * Lấy products cho search
   */
  static async getProductsForSearch(limit = 10) {
    try {
      return await prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          primaryImage: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error fetching products for search:', error);
      throw new Error('Failed to fetch products for search');
    }
  }

  /**
   * Tìm kiếm products theo từ khóa
   */
  static async searchProducts(query: string, limit = 10) {
    try {
      return await prisma.product.findMany({
        where: {
          AND: [
            {
              status: 'PUBLISHED',
              deletedAt: null,
            },
            {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          primaryImage: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }
}