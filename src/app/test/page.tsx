"use client";

import { Header } from '../components/Header';
import { mockProducts, mockCategories, mockBrands } from '../data/mockData';
import Link from 'next/link';
import Image from 'next/image';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header />
      
      {/* Main Content */}
      <main className="pt-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-black to-gray-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Test Menu System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Kiểm tra tất cả các component navigation đã được tạo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#products"
                className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Xem sản phẩm
              </Link>
              <Link
                href="/admin/menu"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors"
              >
                Trang Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Features Test Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Các tính năng đã triển khai
              </h2>
              <p className="text-lg text-gray-600">
                Hãy thử các tính năng navigation sau
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Mega Menu Test */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-2xl mb-3">🖱️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mega Menu
                </h3>
                <p className="text-gray-600 mb-4">
                  Hover vào "Sneakers" hoặc "Boots" trên menu để xem mega menu với sản phẩm nổi bật
                </p>
                <div className="text-sm text-blue-600">
                  ✓ Featured products<br/>
                  ✓ Categories with icons<br/>
                  ✓ Brand showcase
                </div>
              </div>

              {/* Mobile Menu Test */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-2xl mb-3">📱</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mobile Menu
                </h3>
                <p className="text-gray-600 mb-4">
                  Click vào icon hamburger (☰) để mở mobile menu với animation mượt mà
                </p>
                <div className="text-sm text-blue-600">
                  ✓ Slide-out animation<br/>
                  ✓ Expandable sections<br/>
                  ✓ User integration
                </div>
              </div>

              {/* Search Test */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-2xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Search Autocomplete
                </h3>
                <p className="text-gray-600 mb-4">
                  Thử search "Nike", "Adidas" hoặc "Sneakers" để xem suggestions
                </p>
                <div className="text-sm text-blue-600">
                  ✓ Real-time suggestions<br/>
                  ✓ Product/Category/Brand<br/>
                  ✓ Price display
                </div>
              </div>

              {/* Cart Test */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-2xl mb-3">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Shopping Cart
                </h3>
                <p className="text-gray-600 mb-4">
                  Click vào icon giỏ hàng để xem cart dropdown với quantity controls
                </p>
                <div className="text-sm text-blue-600">
                  ✓ Item management<br/>
                  ✓ Quantity controls<br/>
                  ✓ Price calculations
                </div>
              </div>

              {/* User Dropdown Test */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-2xl mb-3">👤</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  User Account
                </h3>
                <p className="text-gray-600 mb-4">
                  Click vào icon user để xem account menu với thông tin user
                </p>
                <div className="text-sm text-blue-600">
                  ✓ Profile management<br/>
                  ✓ Order history<br/>
                  ✓ Account stats
                </div>
              </div>

              {/* Admin Test */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-2xl mb-3">⚙️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Truy cập trang admin để quản lý menu items với CRUD operations
                </p>
                <div className="text-sm text-blue-600">
                  ✓ Menu CRUD<br/>
                  ✓ Drag & drop<br/>
                  ✓ Mega menu config
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Sample */}
        <div id="products" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Sản phẩm mẫu
              </h2>
              <p className="text-lg text-gray-600">
                Dữ liệu mẫu được sử dụng trong các component
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {product.badge && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through mr-2">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(product.originalPrice)}
                          </span>
                        )}
                        <span className="text-lg font-bold text-red-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.price)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="text-yellow-400 mr-1">★</span>
                        {product.rating} ({product.reviews})
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="mr-2">📦 {product.brand}</span>
                      <span className={`ml-2 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {product.inStock ? '✓ Còn hàng' : '✗ Hết hàng'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories & Brands */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Categories */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Danh mục</h3>
                <div className="space-y-4">
                  {mockCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <span className="text-sm text-gray-500">{category.productCount} sản phẩm</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Thương hiệu</h3>
                <div className="space-y-4">
                  {mockBrands.map((brand) => (
                    <div key={brand.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <span className="font-bold text-gray-900">{brand.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{brand.name}</h4>
                        <p className="text-sm text-gray-600">{brand.description}</p>
                      </div>
                      <span className="text-sm text-gray-500">{brand.productCount} sản phẩm</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Hướng dẫn kiểm tra
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">🖥️ Desktop</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Hover vào "Sneakers" hoặc "Boots" để xem mega menu</li>
                  <li>• Thử search với "Nike", "Adidas", "Sneakers"</li>
                  <li>• Click vào icon giỏ hàng (có số 3)</li>
                  <li>• Click vào icon user để xem account menu</li>
                  <li>• Click vào icon tim để xem wishlist</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">📱 Mobile</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Click icon hamburger (☰) để mở mobile menu</li>
                  <li>• Click icon search để mở search bar</li>
                  <li>• Thử expand "Sneakers" trong mobile menu</li>
                  <li>• Scroll xuống để xem sticky header effect</li>
                  <li>• Test tất cả touch interactions</li>
                </ul>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/admin/menu"
                className="inline-flex items-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                🔧 Mở trang Admin để quản lý Menu
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Test page cho Menu System - VUKI Website
          </p>
        </div>
      </footer>
    </div>
  );
}