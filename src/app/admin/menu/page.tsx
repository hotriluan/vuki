"use client";

import { useState } from 'react';
import { 
  Bars3Icon,
  HomeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { MenuManagement } from '../../../components/admin/MenuManagement';

export default function AdminMenuPage() {
  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu & Navigation</h1>
            <p className="text-gray-600 mt-1">
              Quản lý cấu trúc menu website, mega menu và các liên kết điều hướng
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Đang hoạt động
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bars3Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng menu</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HomeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hiển thị</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mega Menu</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Có badge</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Management Component */}
      <MenuManagement />

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-lg font-medium text-gray-900 mb-1">
              🔄 Cập nhật cache menu
            </div>
            <p className="text-sm text-gray-600">
              Làm mới cache để hiển thị thay đổi ngay lập tức
            </p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-lg font-medium text-gray-900 mb-1">
              📋 Xuất cấu hình
            </div>
            <p className="text-sm text-gray-600">
              Tải xuống file cấu hình menu hiện tại
            </p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="text-lg font-medium text-gray-900 mb-1">
              📤 Nhập cấu hình
            </div>
            <p className="text-sm text-gray-600">
              Tải lên file cấu hình menu từ backup
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}