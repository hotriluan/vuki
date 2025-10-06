import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Suspense } from 'react';
import { findCategoryBySlug } from '@/lib/data';
import { productService } from '@/domain/product';
import { Price } from '../../../components/Price';
import AddToCartButton from './AddToCartButton';
import { buildProductMetadata, buildProductJsonLd } from '@/lib/seo';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { WishlistButton } from '@/components/WishlistButton';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { pushRecentlyViewed } from '@/lib/recentlyViewed';
import { getAggregatedRating } from '@/lib/reviews';

// Dynamic chunks: large or secondary UX blocks
const ProductReviews = dynamic(() => import('@/components/ProductReviews').then(m => m.ProductReviews), {
  loading: () => <div className="text-sm text-gray-500 py-10">Loading reviews...</div>,
  ssr: false
});
const RelatedProducts = dynamic(() => import('@/components/RelatedProducts').then(m => m.RelatedProducts), {
  loading: () => <div className="text-sm text-gray-500">Loading related...</div>
});
const RecentlyViewed = dynamic(() => import('@/components/RecentlyViewed').then(m => m.RecentlyViewed), {
  loading: () => <div className="text-sm text-gray-500">Loading recently viewed...</div>,
  ssr: false
});

interface Props { params: { slug: string }; }

interface GenerateMetadataProps { params: { slug: string } }

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const product = await productService.getBySlug(params.slug);
  if (!product) return {};
  return buildProductMetadata(product) as Metadata;
}

export const revalidate = 3600; // 1h ISR for product pages

export async function generateStaticParams() {
  const list = await productService.list();
  return list.map(p => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const product = await productService.getBySlug(params.slug);
  if (!product) return notFound();
  const agg = getAggregatedRating(product.id);
  const jsonLd = {
    ...buildProductJsonLd(product),
    ...(agg ? { aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: agg.average.toFixed(1),
      reviewCount: agg.count
    }} : {})
  } as any;
  const category = product.categoryIds?.length ? await findCategoryBySlug(product.categoryIds[0]) : null;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: '/'
      },
      ...(category ? [{
        '@type': 'ListItem',
        position: 2,
        name: category!.name,
        item: `/category/${category!.slug}`
      }] : []),
      {
        '@type': 'ListItem',
        position: category ? 3 : 2,
        name: product.name,
        item: `/product/${product.slug}`
      }
    ]
  };
  // client effect to store recently viewed (guard for SSR)
  if (typeof window !== 'undefined') {
    // minimal defer using requestIdleCallback / fallback
    const run = () => pushRecentlyViewed(product.id);
    (window as any).requestIdleCallback ? (window as any).requestIdleCallback(run) : setTimeout(run, 0);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2" data-page="product">
      <div className="relative">
        <ProductImageGallery 
          images={product.images || []} 
          productName={product.name}
        />
        <WishlistButton productId={product.id} variant="detail" className="absolute top-4 left-4 z-10" />
      </div>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">{product.name}</h1>
            <Price price={product.price} salePrice={product.salePrice} />
          </div>
        </div>
        <div 
          className="text-sm leading-relaxed text-gray-700 max-w-prose prose prose-sm"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <AddToCartButton product={product} />
      </div>
      <Script id="ld-product" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="ld-breadcrumb" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="md:col-span-2 space-y-12">
        <Suspense fallback={<div className="text-sm text-gray-500">Preparing reviews…</div>}>
          <ProductReviews productId={product.id} />
        </Suspense>
        <Suspense fallback={<div className="text-sm text-gray-500">Preparing related…</div>}>
          <RelatedProducts product={product} />
        </Suspense>
        <Suspense fallback={<div className="text-sm text-gray-500">Preparing recently viewed…</div>}>
          <RecentlyViewed />
        </Suspense>
      </div>
    </div>
  );
}
