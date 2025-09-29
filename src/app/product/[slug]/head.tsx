import { findProductBySlug } from '@/lib/data';
import { buildCanonical, formatPriceForMeta, productDescription } from '@/lib/seo';

interface Props { params: { slug: string } }

export default function Head({ params }: Props) {
  const product = findProductBySlug(params.slug);
  if (!product) return null;
  const price = formatPriceForMeta(product);
  const canonical = buildCanonical(`/product/${product.slug}`);
  const description = productDescription(product);
  const images = product.images?.length ? product.images : [];
  return (
    <>
      {/* Override / add product-specific OG tags */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={description} />
      {images[0] && <meta property="og:image" content={images[0]} />}
      {/* Facebook product structured meta (optional) */}
      <meta property="product:price:amount" content={String(price)} />
      <meta property="product:price:currency" content="VND" />
      <meta property="product:availability" content="in stock" />
      {/* Canonical (Next metadata also sets alternates.canonical) */}
      <link rel="canonical" href={canonical} />
    </>
  );
}
