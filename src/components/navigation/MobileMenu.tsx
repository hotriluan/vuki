"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface NavigationItem {
  name: string;
  href: string;
  badge?: string;
  megaMenu?: any;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
}

export function MobileMenu({ open, onClose, navigation }: MobileMenuProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-black to-gray-800">
                      <h2 className="text-lg font-semibold text-white">Menu</h2>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-white hover:bg-white/20"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* User Section */}
                    <div className="p-4 border-b bg-gray-50">
                      <Link
                        href="/account"
                        onClick={onClose}
                        className="flex items-center space-x-3"
                      >
                        <div className="h-12 w-12 bg-gradient-to-br from-black to-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Tài khoản của tôi</p>
                          <p className="text-sm text-gray-500">Đăng nhập / Đăng ký</p>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-auto" />
                      </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 p-4">
                      <nav className="space-y-1">
                        {navigation.map((item) => (
                          <div key={item.name}>
                            <div className="flex items-center justify-between">
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="flex-1 flex items-center space-x-3 py-3 text-gray-900 font-medium rounded-lg hover:bg-gray-50"
                              >
                                <span>{item.name}</span>
                                {item.badge && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                              {item.megaMenu && (
                                <button
                                  onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <ChevronDownIcon 
                                    className={`h-5 w-5 text-gray-400 transition-transform ${
                                      expandedItem === item.name ? 'rotate-180' : ''
                                    }`} 
                                  />
                                </button>
                              )}
                            </div>

                            {/* Expanded submenu */}
                            {item.megaMenu && expandedItem === item.name && (
                              <div className="ml-4 mt-2 space-y-3 pb-4">
                                {/* Featured Products */}
                                {item.megaMenu.featured && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                                      Sản phẩm nổi bật
                                    </p>
                                    {item.megaMenu.featured.slice(0, 2).map((product: any, index: number) => (
                                      <Link
                                        key={index}
                                        href={product.href}
                                        onClick={onClose}
                                        className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded-lg"
                                      >
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0"></div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                          <p className="text-xs text-red-600 font-semibold">
                                            {new Intl.NumberFormat('vi-VN', {
                                              style: 'currency',
                                              currency: 'VND'
                                            }).format(product.price)}
                                          </p>
                                        </div>
                                        {product.badge && (
                                          <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                                            {product.badge}
                                          </span>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                )}

                                {/* Categories */}
                                {item.megaMenu.categories && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                                      Danh mục
                                    </p>
                                    <div className="grid grid-cols-2 gap-1">
                                      {item.megaMenu.categories.map((category: any, index: number) => (
                                        <Link
                                          key={index}
                                          href={category.href}
                                          onClick={onClose}
                                          className="flex items-center space-x-2 py-2 px-2 text-gray-700 hover:bg-gray-50 rounded"
                                        >
                                          {category.icon && <span className="text-sm">{category.icon}</span>}
                                          <span className="text-sm">{category.name}</span>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Brands */}
                                {item.megaMenu.brands && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                                      Thương hiệu
                                    </p>
                                    <div className="grid grid-cols-2 gap-1">
                                      {item.megaMenu.brands.map((brand: any, index: number) => (
                                        <Link
                                          key={index}
                                          href={brand.href}
                                          onClick={onClose}
                                          className="py-2 px-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                                        >
                                          {brand.name}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </nav>

                      {/* Quick Actions */}
                      <div className="mt-8 pt-6 border-t">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                          Liên kết nhanh
                        </h3>
                        <div className="space-y-3">
                          <Link
                            href="/new-arrivals"
                            onClick={onClose}
                            className="flex items-center space-x-3 text-green-600 py-2 hover:bg-green-50 rounded-lg px-2"
                          >
                            <span className="text-xl">🆕</span>
                            <span className="font-medium">Hàng mới về</span>
                          </Link>
                          <Link
                            href="/bestsellers"
                            onClick={onClose}
                            className="flex items-center space-x-3 text-orange-600 py-2 hover:bg-orange-50 rounded-lg px-2"
                          >
                            <span className="text-xl">🔥</span>
                            <span className="font-medium">Bán chạy nhất</span>
                          </Link>
                          <Link
                            href="/sale"
                            onClick={onClose}
                            className="flex items-center space-x-3 text-red-600 py-2 hover:bg-red-50 rounded-lg px-2"
                          >
                            <span className="text-xl">💥</span>
                            <span className="font-medium">Khuyến mãi</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t bg-gray-50">
                      <div className="text-center space-y-3">
                        <p className="text-sm text-gray-600">
                          Hotline: <span className="font-semibold text-black">1900 1234</span>
                        </p>
                        <div className="flex justify-center space-x-6">
                          <Link href="/support" onClick={onClose} className="text-sm text-gray-600 hover:text-black">
                            Hỗ trợ
                          </Link>
                          <Link href="/contact" onClick={onClose} className="text-sm text-gray-600 hover:text-black">
                            Liên hệ
                          </Link>
                          <Link href="/stores" onClick={onClose} className="text-sm text-gray-600 hover:text-black">
                            Cửa hàng
                          </Link>
                        </div>
                        <div className="flex justify-center space-x-4 pt-2">
                          <span className="text-2xl">📘</span>
                          <span className="text-2xl">📷</span>
                          <span className="text-2xl">📱</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}