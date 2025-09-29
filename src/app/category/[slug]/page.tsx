import { notFound } from 'next/navigation';
import Link from 'next/link';
import { productsByCategorySlug, findCategoryBySlug } from '@/lib/data';
import { InfiniteCategory } from '@/components/InfiniteCategory';

interface Props { params: { slug: string }; }

export default function CategoryPage({ params }: Props) {
  const category = findCategoryBySlug(params.slug);
  if (!category) return notFound();
  const items = productsByCategorySlug(params.slug);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">{category.name}</h1>
      {items.length === 0 && <p className="text-sm text-gray-500">No products yet.</p>}
      <InfiniteCategory slug={params.slug} />
      <div className="mt-10">
        <Link href="/" className="text-sm text-brand-accent hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
