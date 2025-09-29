import { notFound } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { findProductBySlug, findCategoryBySlug } from '@/lib/data';
import { Price } from '../../../components/Price';
import AddToCartButton from './AddToCartButton';
import { buildProductMetadata, buildProductJsonLd } from '@/lib/seo';
import type { Metadata } from 'next';
import { WishlistButton } from '@/components/WishlistButton';
import { ProductImage } from '@/components/ProductImage';

interface Props { params: { slug: string }; }

interface GenerateMetadataProps { params: { slug: string } }

export function generateMetadata({ params }: GenerateMetadataProps): Metadata {
  const product = findProductBySlug(params.slug);
  if (!product) return {};
  return buildProductMetadata(product) as Metadata;
}

export default function ProductPage({ params }: Props) {
  const product = findProductBySlug(params.slug);
  if (!product) return notFound();
  const image = product.images[0];
  const jsonLd = buildProductJsonLd(product);
  const category = product.categoryIds?.length ? findCategoryBySlug(product.categoryIds[0]) : null;
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
        name: category.name,
        item: `/category/${category.slug}`
      }] : []),
      {
        '@type': 'ListItem',
        position: category ? 3 : 2,
        name: product.name,
        item: `/product/${product.slug}`
      }
    ]
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid gap-10 md:grid-cols-2">
      <div>
        {image && (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded border">
            <ProductImage src={image} alt={product.name} fill className="object-cover" />
            <WishlistButton productId={product.id} variant="detail" />
          </div>
        )}
      </div>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">{product.name}</h1>
            <Price price={product.price} salePrice={product.salePrice} />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-gray-700 max-w-prose">{product.description}</p>
        <AddToCartButton product={product} />
      </div>
      <Script id="ld-product" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Script id="ld-breadcrumb" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </div>
  );
}
