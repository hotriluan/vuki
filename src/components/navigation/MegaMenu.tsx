"use client";

import Link from 'next/link';
import Image from 'next/image';

interface MegaMenuData {
  featured: Array<{
    name: string;
    image: string;
    href: string;
    price: number;
    badge?: string;
  }>;
  categories: Array<{
    name: string;
    href: string;
    icon?: string;
  }>;
  brands: Array<{
    name: string;
    href: string;
    logo?: string;
  }>;
  promotions?: {
    title: string;
    description: string;
    image: string;
    href: string;
    countdown?: Date;
  };
}

interface MegaMenuProps {
  data: MegaMenuData;
}

export function MegaMenu({ data }: MegaMenuProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="absolute left-0 top-full w-screen bg-white border-t shadow-xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Featured Products */}
          <div className="col-span-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm nổi bật</h3>
            <div className="space-y-4">
              {data.featured.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="64px"
                    />
                    {item.badge && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-lg font-bold text-red-600">{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-500 group-hover:text-blue-600">Xem chi tiết →</p>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Promotional banner */}
            {data.promotions && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{data.promotions.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{data.promotions.description}</p>
                <Link href={data.promotions.href} className="text-blue-600 text-sm font-medium hover:underline">
                  Mua ngay →
                </Link>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="col-span-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
            <div className="grid grid-cols-2 gap-2">
              {data.categories.map((category, index) => (
                <Link
                  key={index}
                  href={category.href}
                  className="flex items-center space-x-2 p-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {category.icon && <span className="text-lg">{category.icon}</span>}
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Liên kết nhanh</h4>
              <div className="space-y-2">
                <Link href="/new-arrivals" className="flex items-center space-x-2 text-green-600 hover:underline">
                  <span>🆕</span>
                  <span>Hàng mới về</span>
                </Link>
                <Link href="/bestsellers" className="flex items-center space-x-2 text-orange-600 hover:underline">
                  <span>🔥</span>
                  <span>Bán chạy nhất</span>
                </Link>
                <Link href="/sale" className="flex items-center space-x-2 text-red-600 hover:underline">
                  <span>💥</span>
                  <span>Khuyến mãi</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Brands */}
          <div className="col-span-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thương hiệu</h3>
            <div className="grid grid-cols-2 gap-2">
              {data.brands.map((brand, index) => (
                <Link
                  key={index}
                  href={brand.href}
                  className="p-3 text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors font-medium text-center"
                >
                  {brand.logo ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-8 h-8 relative">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain"
                          sizes="32px"
                        />
                      </div>
                      <span className="text-sm">{brand.name}</span>
                    </div>
                  ) : (
                    brand.name
                  )}
                </Link>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Đăng ký nhận tin</h4>
              <p className="text-sm text-gray-600 mb-3">Nhận thông báo về sản phẩm mới và khuyến mãi</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}