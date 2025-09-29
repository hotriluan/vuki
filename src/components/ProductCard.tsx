import Link from 'next/link';
import { BlurImage } from './BlurImage';
import { Product } from '@/lib/types';
import { Price } from './Price';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  return (
    <div className="group relative rounded-lg border bg-white p-3 shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded">
        <div className="relative aspect-[4/5] w-full">
          {primaryImage && (
            <BlurImage
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
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
      <WishlistButton productId={product.id} variant="card" />
    </div>
  );
}
