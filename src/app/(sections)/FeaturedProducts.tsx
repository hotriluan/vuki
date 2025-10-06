import { getProducts } from '@/lib/data';
import { ProductCard } from '@/components/ProductCard';

export async function FeaturedProducts() {
  const all = await getProducts();
  const featured = all.filter(p => p.featured);
  if (featured.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Featured</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {featured.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
