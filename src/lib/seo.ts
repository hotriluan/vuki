import type { Product } from './types';

// Base site settings (can evolve to a config file or CMS later)
export const siteName = 'Shoe Store Starter';
export const siteTagline = 'Modern shoe e-commerce starter built with Next.js';

// Resolve site URL from env (no trailing slash)
export function getSiteUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return env.replace(/\/$/, '');
}

export function buildCanonical(pathname: string) {
  return getSiteUrl() + pathname;
}

export function formatPriceForMeta(product: Product) {
  // Return raw number (VND) for structured data (no formatting separators)
  const active = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  return active;
}

export function productTitle(product: Product) {
  return `${product.name} | ${siteName}`;
}

export function productDescription(product: Product) {
  // Fallback if description is very long - slice (Google usually uses first ~155 chars)
  const base = product.description || siteTagline;
  return base.length > 155 ? base.slice(0, 152) + '...' : base;
}

export function buildProductMetadata(product: Product) {
  const canonical = buildCanonical(`/product/${product.slug}`);
  const title = productTitle(product);
  const description = productDescription(product);
  const images = product.images?.length ? product.images : undefined;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      images: images?.map((url) => ({ url, width: 800, height: 1000, alt: product.name }))
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images?.[0]
    }
  } as const;
}

export function buildProductJsonLd(product: Product) {
  const price = formatPriceForMeta(product) / 1000 * 1000; // price already integer VND; normalize to 1000 step
  const availability = 'https://schema.org/InStock'; // mock inventory assumes in stock; could vary per variant
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: productDescription(product),
    image: product.images,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price,
      availability,
      url: buildCanonical(`/product/${product.slug}`)
    }
  };
}
