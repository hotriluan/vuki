"use client";

import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserIcon, 
  HeartIcon, 
  ClockIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { mockUserData, mockOrders, mockWishlistItems } from '../../data/mockData';

interface UserDropdownProps {
  className?: string;
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserDropdown({ className = '', isLoggedIn = false, user }: UserDropdownProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Use mock data for testing
  const userData = mockUserData;
  const userOrders = mockOrders;
  const userWishlist = mockWishlistItems;

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    // Handle logout logic here
    console.log('Logging out...');
  };

  if (!userData.isLoggedIn) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Link
          href="/login"
          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span>Đăng nhập</span>
        </Link>
        <Link
          href="/register"
          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
        >
          <UserPlusIcon className="h-4 w-4" />
          <span>Đăng ký</span>
        </Link>
      </div>
    );
  }

  return (
    <Menu as="div" className={`relative ${className}`}>
      <Menu.Button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
        {userData.user?.avatar ? (
          <img
            src={userData.user.avatar}
            alt={userData.user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-gray-600" />
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {userData.user?.name || 'Tài khoản'}
          </p>
          <p className="text-xs text-gray-500">
            {userData.user?.email || 'Quản lý tài khoản'}
          </p>
        </div>
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
        <Menu.Panel className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="p-4 border-b bg-gradient-to-r from-black to-gray-800">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div className="text-white">
                <p className="font-semibold">{user?.name || 'Người dùng'}</p>
                <p className="text-sm text-gray-200">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>

          <div className="py-1">
            {/* Account Management */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account"
                  className={`flex items-center space-x-3 px-4 py-3 text-sm ${
                    active ? 'bg-gray-50 text-black' : 'text-gray-700'
                  } transition-colors`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Thông tin tài khoản</span>
                </Link>
              )}
            </Menu.Item>

            {/* Orders */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account/orders"
                  className={`flex items-center space-x-3 px-4 py-3 text-sm ${
                    active ? 'bg-gray-50 text-black' : 'text-gray-700'
                  } transition-colors`}
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span>Đơn hàng của tôi</span>
                </Link>
              )}
            </Menu.Item>

            {/* Wishlist */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account/wishlist"
                  className={`flex items-center space-x-3 px-4 py-3 text-sm ${
                    active ? 'bg-gray-50 text-black' : 'text-gray-700'
                  } transition-colors`}
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Sản phẩm yêu thích</span>
                </Link>
              )}
            </Menu.Item>

            {/* Recently Viewed */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account/recently-viewed"
                  className={`flex items-center space-x-3 px-4 py-3 text-sm ${
                    active ? 'bg-gray-50 text-black' : 'text-gray-700'
                  } transition-colors`}
                >
                  <ClockIcon className="h-5 w-5" />
                  <span>Đã xem gần đây</span>
                </Link>
              )}
            </Menu.Item>

            <div className="border-t my-1"></div>

            {/* Support */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/support"
                  className={`flex items-center space-x-3 px-4 py-3 text-sm ${
                    active ? 'bg-gray-50 text-black' : 'text-gray-700'
                  } transition-colors`}
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  <span>Hỗ trợ khách hàng</span>
                </Link>
              )}
            </Menu.Item>

            {/* Settings */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/account/settings"
                  className={`flex items-center space-x-3 px-4 py-3 text-sm ${
                    active ? 'bg-gray-50 text-black' : 'text-gray-700'
                  } transition-colors`}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Cài đặt</span>
                </Link>
              )}
            </Menu.Item>

            <div className="border-t my-1"></div>

            {/* Logout */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm ${
                    active ? 'bg-red-50 text-red-600' : 'text-red-600'
                  } transition-colors`}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Đăng xuất</span>
                </button>
              )}
            </Menu.Item>
          </div>

          {/* Quick Stats */}
          <div className="border-t p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-black">12</p>
                <p className="text-xs text-gray-600">Đơn hàng</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">5</p>
                <p className="text-xs text-gray-600">Yêu thích</p>
              </div>
            </div>
          </div>
        </Menu.Panel>
      </Transition>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Xác nhận đăng xuất
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </Menu>
  );
}