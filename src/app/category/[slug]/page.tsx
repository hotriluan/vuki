import { notFound } from 'next/navigation';
import Link from 'next/link';
import { productsByCategorySlug, findCategoryBySlug, categories } from '@/lib/data';
import Script from 'next/script';
import { Suspense } from 'react';
import { InfiniteCategory } from '@/components/InfiniteCategory';
import { FilterClient } from './FilterClient';

interface Props { params: { slug: string }; }

export const revalidate = 1800; // 30m ISR for category pages

export function generateStaticParams() {
  return categories.map(c => ({ slug: c.slug }));
}

export default function CategoryPage({ params }: Props) {
  const category = findCategoryBySlug(params.slug);
  if (!category) return notFound();
  // Extract query params via headers (workaround for app router server component w/out searchParams prop pre destructuring) – we will rely on searchParams soon if upgrade signature.
  // For simplicity fallback to no filter on server; client side hydration will enhance.
  const items = productsByCategorySlug(params.slug);
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      { '@type': 'ListItem', position: 2, name: category.name, item: `/category/${category.slug}` }
    ]
  };
  return (
  <div className="mx-auto max-w-7xl px-4 py-10" data-page="category">
      <nav className="text-xs mb-3 flex gap-1 text-gray-600" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">Home</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200" aria-current="page">{category.name}</span>
      </nav>
      <Script id="ld-breadcrumb-category" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <h1 className="text-2xl font-semibold mb-6">{category.name}</h1>
      {items.length === 0 && <p className="text-sm text-gray-500">No products yet.</p>}
  <FilterClient slug={params.slug} initial={items} />
      <div className="mt-10">
        <Link href="/" className="text-sm text-brand-accent hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}

// FilterClient moved to separate client file
