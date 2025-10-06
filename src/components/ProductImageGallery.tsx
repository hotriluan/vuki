"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { ProductImage } from './ProductImage';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

export function ProductImageGallery({ images, productName, className = '' }: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false
  });
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded border bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No images available</span>
        </div>
      </div>
    );
  }

  const currentImage = images[selectedImageIndex];

  // Handle thumbnail navigation
  const selectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsZoomed(false);
  }, []);

  // Navigate to previous/next image
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (selectedImageIndex - 1 + images.length) % images.length
      : (selectedImageIndex + 1) % images.length;
    selectImage(newIndex);
  }, [selectedImageIndex, images.length, selectImage]);

  // Handle touch events for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.isDragging) return;
    
    const touch = e.touches[0];
    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY
    }));
  }, [touchState.isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!touchState.isDragging) return;
    
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = Math.abs(touchState.currentY - touchState.startY);
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      if (deltaX > 0) {
        navigateImage('prev');
      } else {
        navigateImage('next');
      }
    }
    
    setTouchState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false
    });
  }, [touchState, navigateImage]);

  // Handle zoom functionality
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !mainImageRef.current) return;
    
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isZoomed]);

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  // Handle lightbox
  const openLightbox = useCallback((index: number = selectedImageIndex) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, [selectedImageIndex]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (lightboxImageIndex - 1 + images.length) % images.length
      : (lightboxImageIndex + 1) % images.length;
    setLightboxImageIndex(newIndex);
  }, [lightboxImageIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, closeLightbox, navigateLightbox]);

  // Scroll thumbnails into view
  const scrollThumbnailIntoView = useCallback((index: number) => {
    if (!thumbnailContainerRef.current) return;
    
    const container = thumbnailContainerRef.current;
    const thumbnail = container.children[index] as HTMLElement;
    if (!thumbnail) return;

    const containerRect = container.getBoundingClientRect();
    const thumbnailRect = thumbnail.getBoundingClientRect();
    
    if (thumbnailRect.left < containerRect.left) {
      container.scrollLeft -= containerRect.left - thumbnailRect.left + 10;
    } else if (thumbnailRect.right > containerRect.right) {
      container.scrollLeft += thumbnailRect.right - containerRect.right + 10;
    }
  }, []);

  useEffect(() => {
    scrollThumbnailIntoView(selectedImageIndex);
  }, [selectedImageIndex, scrollThumbnailIntoView]);

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image */}
        <div className="relative">
          <div 
            ref={mainImageRef}
            className={`relative aspect-[4/5] w-full overflow-hidden rounded border cursor-pointer group ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => openLightbox()}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZoomed(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ProductImage
              src={currentImage}
              alt={`${productName} - Image ${selectedImageIndex + 1}`}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={isZoomed ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
              } : {}}
              priority={selectedImageIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            {/* Zoom toggle button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              title={isZoomed ? "Zoom out" : "Zoom in"}
            >
              {isZoomed ? (
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              ) : (
                <MagnifyingGlassIcon className="w-5 h-5" />
              )}
            </button>

            {/* Navigation arrows (only show if multiple images) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('prev');
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage('next');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Next image"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="relative">
            <div 
              ref={thumbnailContainerRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                    index === selectedImageIndex
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={`View image ${index + 1}`}
                >
                  <ProductImage
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full max-w-7xl max-h-full p-4 flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title="Close (Esc)"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
              {lightboxImageIndex + 1} / {images.length}
            </div>

            {/* Main lightbox image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <ProductImage
                src={images[lightboxImageIndex]}
                alt={`${productName} - Image ${lightboxImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  title="Previous image (←)"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                  title="Next image (→)"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Thumbnail strip at bottom */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto p-2 bg-black/30 rounded-lg">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxImageIndex(index)}
                    className={`relative flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                      index === lightboxImageIndex
                        ? 'border-white'
                        : 'border-white/50 hover:border-white/80'
                    }`}
                  >
                    <ProductImage
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}