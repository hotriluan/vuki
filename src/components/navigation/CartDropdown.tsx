"use client";

import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { mockCartItems } from '../../data/mockData';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  variant?: string;
  href: string;
}

interface CartDropdownProps {
  className?: string;
}

export function CartDropdown({ className = '' }: CartDropdownProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Use mock cart data
  useEffect(() => {
    setCartItems(mockCartItems);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Menu as="div" className={`relative ${className}`}>
      <Menu.Button className="relative p-2 text-gray-900 hover:text-black transition-colors">
        <ShoppingCartIcon className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Panel className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Giỏ hàng ({totalItems})
              </h3>
              {cartItems.length > 0 && (
                <Link 
                  href="/cart"
                  className="text-sm text-black hover:text-gray-700 font-medium"
                >
                  Xem tất cả
                </Link>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-gray-500 text-sm mb-4">
                  Giỏ hàng của bạn đang trống
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <Link href={item.href} className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link 
                          href={item.href}
                          className="block hover:text-black transition-colors"
                        >
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.variant}
                            </p>
                          )}
                        </Link>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(item.originalPrice)}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-red-600">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.price)}
                            </span>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium px-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">Tổng cộng:</span>
                <span className="text-lg font-bold text-red-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(totalPrice)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  className="px-4 py-2 text-center text-sm font-medium text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Xem giỏ hàng
                </Link>
                <Link
                  href="/checkout"
                  className="px-4 py-2 text-center text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Thanh toán
                </Link>
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                Miễn phí vận chuyển cho đơn hàng trên 500.000đ
              </p>
            </div>
          )}
        </Menu.Panel>
      </Transition>
    </Menu>
  );
}