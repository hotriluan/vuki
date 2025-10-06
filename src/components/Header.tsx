"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { MegaMenu } from './navigation/MegaMenu';
import { MobileMenu } from './navigation/MobileMenu';
import { SearchBar } from './navigation/SearchBar';
import { CartDropdown } from './navigation/CartDropdown';
import { UserDropdown } from './navigation/UserDropdown';
import { useMenuData } from '../hooks/useMenuData';
import { transformMenuData, NavigationItem } from '../utils/menuTransform';
import { 
  mockCartItems, 
  mockWishlistItems, 
  mockUserData 
} from '../data/mockData';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);

  // Fetch menu data from API
  const { menuData, loading, error } = useMenuData();

  // Transform menu data to navigation format
  useEffect(() => {
    if (menuData) {
      const navItems = transformMenuData(menuData.categories, menuData.featuredProducts);
      setNavigation(navItems);
    }
  }, [menuData]);

  // Use mock data for cart and wishlist (can be replaced with real data later)
  const totalItems = mockCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = mockWishlistItems.length;

  // Sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <header className="bg-white shadow-sm">
        <div className="bg-gradient-to-r from-black to-gray-800 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center space-x-4">
            <span>🔥 Flash Sale: Giảm đến 50%</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">📦 Miễn phí ship đơn từ 500k</span>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-gray-600">Đang tải menu...</span>
          </div>
        </div>
      </header>
    );
  }

  // Show error state
  if (error) {
    console.error('Menu loading error:', error);
    // Fallback to empty navigation but still show header structure
  }

  return (
    <>
      <header className={`bg-white shadow-sm transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-40 shadow-lg' : 'relative'}`}>
        {/* Top banner */}
        <div className="bg-gradient-to-r from-black to-gray-800 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center space-x-4">
            <span>🔥 Flash Sale: Giảm đến 50%</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">📦 Miễn phí ship đơn từ 500k</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-gradient-to-br from-black to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">VUKI</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.megaMenu && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-black"
                  >
                    {item.name}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  
                  {/* Mega Menu */}
                  {item.megaMenu && activeDropdown === item.name && (
                    <MegaMenu data={item.megaMenu} />
                  )}
                </div>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-lg mx-8">
              <SearchBar />
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Search icon - Mobile/Tablet */}
              <button 
                className="lg:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors relative">
                <HeartIcon className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <CartDropdown />

              {/* User Account */}
              <UserDropdown />

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Conditional */}
          {searchOpen && (
            <div className="lg:hidden pb-4 border-t mt-4 pt-4">
              <SearchBar />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
      />

      {/* Spacer for sticky header */}
      {isSticky && <div className="h-16" />}
    </>
  );
}
