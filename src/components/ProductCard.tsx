import Link from 'next/link';
import { BlurImage } from './BlurImage';
import { Product } from '@/lib/types';
import { Price } from './Price';
import { WishlistButton } from './WishlistButton';
import { EyeIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const primaryImage = product.primaryImage || (product.images && product.images.length ? product.images[0] : undefined);
  // Heuristic: mark as priority if likely above the fold (can be refined by parent injecting prop later)
  const isLikelyAboveFold = typeof window === 'undefined'; // SSR first batch
  return (
    <div className="group relative rounded-lg border bg-white p-3 shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded">
        <div className="relative aspect-[4/5] w-full group/image">
          {primaryImage && (
            <BlurImage
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
              priority={isLikelyAboveFold}
            />
          )}
          
          {/* Quick view button overlay */}
          {onQuickView && (
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm opacity-0 group-hover/image:opacity-100 md:group-hover/image:opacity-100 group-hover/image:opacity-100 transform translate-y-2 group-hover/image:translate-y-0 transition-all duration-200 hover:bg-gray-100 flex items-center gap-2 touch-manipulation min-h-[44px] sm:opacity-100 sm:translate-y-0"
                aria-label={`Quick view ${product.name}`}
              >
                <EyeIcon className="w-4 h-4" />
                Quick View
              </button>
            </div>
          )}
        </div>
      </Link>
      <div className="mt-3 flex flex-col gap-1">
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:text-brand-accent">
          {product.name}
        </Link>
        <Price price={product.price} salePrice={product.salePrice} className="text-sm" />
      </div>
      {product.salePrice && product.salePrice < product.price && (
        <span className="absolute left-2 top-2 rounded bg-brand-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Sale</span>
      )}
      {product.featured && (
        <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">Hot</span>
      )}
      {/* Defer wishlist button hydrate (could be further optimized with dynamic import) */}
      <div className="[&_button]:opacity-0 [&_button]:data-[hydrated=true]:opacity-100 transition-opacity duration-300">
        <WishlistButton productId={product.id} variant="card" />
      </div>
    </div>
  );
}
