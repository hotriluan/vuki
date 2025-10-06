"use client";
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProductImageGallery } from './ProductImageGallery';
import { Price } from './Price';
import { WishlistButton } from './WishlistButton';
import { Product } from '@/lib/types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedVariant(null);
      setIsAddingToCart(false);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      // Simulate API call (replace with actual cart logic)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // You would implement actual cart logic here
      console.log('Added to cart:', {
        productId: product.id,
        quantity,
        variant: selectedVariant
      });
      
      // Close modal after successful add
      onClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden md:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row max-h-[calc(90vh-80px)] md:max-h-[calc(85vh-80px)]">
          {/* Left side - Images */}
          <div className="md:w-1/2 p-4">
            <div className="relative">
              <ProductImageGallery 
                images={product.images || []} 
                productName={product.name}
                className="max-w-md mx-auto"
              />
              <WishlistButton 
                productId={product.id} 
                variant="detail" 
                className="absolute top-2 right-2 z-10 touch-manipulation" 
              />
            </div>
          </div>

          {/* Right side - Product details */}
          <div className="md:w-1/2 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Product name and price */}
              <div>
                <h1 className="text-xl font-semibold mb-2 leading-tight">{product.name}</h1>
                <Price 
                  price={product.price} 
                  salePrice={product.salePrice} 
                  className="text-lg"
                />
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-sm text-gray-600 line-clamp-3 md:line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.id)}
                        disabled={variant.stock === 0}
                        className={`px-3 py-2 border rounded text-sm transition-colors touch-manipulation min-h-[44px] ${
                          selectedVariant === variant.id
                            ? 'border-black bg-black text-white'
                            : variant.stock === 0
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {variant.label}
                        {variant.stock !== undefined && (
                          <span className="ml-1 text-xs">
                            ({variant.stock === 0 ? 'Out' : variant.stock})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 touch-manipulation"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 touch-manipulation"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart button */}
              <div className="pt-4 space-y-3 sticky bottom-0 bg-white pb-4 md:static md:pb-0">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || (product.variants && product.variants.length > 0 && !selectedVariant)}
                  className="w-full bg-black text-white py-3 px-4 rounded font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[48px] touch-manipulation"
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => window.open(`/product/${product.slug}`, '_blank')}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded font-medium hover:bg-gray-50 transition-colors min-h-[48px] touch-manipulation"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing quick view state
export function useQuickView() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
    // Delay clearing the product to allow for exit animation
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return {
    selectedProduct,
    isOpen,
    openQuickView,
    closeQuickView
  };
}