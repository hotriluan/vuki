"use client";

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { mockSearchSuggestions } from '../../data/mockData';

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'product' | 'category' | 'brand';
  href: string;
  image?: string;
  price?: number;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ className = '', placeholder = 'Tìm kiếm sản phẩm...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Use mock suggestions data
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const filtered = mockSearchSuggestions.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      setIsOpen(false);
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return '📱';
      case 'category': return '📂';
      case 'brand': return '🏷️';
      default: return '🔍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Sản phẩm';
      case 'category': return 'Danh mục';
      case 'brand': return 'Thương hiệu';
      default: return '';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full py-3 pl-12 pr-12 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-4 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-12">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.length > 0 ? (
            <>
              <div className="p-3 border-b bg-gray-50">
                <p className="text-sm text-gray-600">
                  Tìm thấy <span className="font-semibold">{suggestions.length}</span> kết quả cho "{query}"
                </p>
              </div>
              
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <Link
                    key={suggestion.id}
                    href={suggestion.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.name}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {getTypeLabel(suggestion.type)}
                        </span>
                      </div>
                      
                      {suggestion.price && (
                        <p className="text-sm text-red-600 font-semibold">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(suggestion.price)}
                        </p>
                      )}
                    </div>

                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>

              {/* View All Results */}
              <div className="border-t bg-gray-50 p-3">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2 text-sm font-medium text-black hover:text-gray-700 transition-colors"
                >
                  Xem tất cả kết quả cho "{query}" →
                </Link>
              </div>
            </>
          ) : query.trim() && !loading ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 text-sm">
                Không tìm thấy kết quả nào cho "{query}"
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}