import { FeaturedProducts } from './(sections)/FeaturedProducts';

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-white to-gray-50 border-b">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Modern Shoe Store</h1>
          <p className="text-gray-600 max-w-xl text-sm md:text-base">A clean, extensible starter for building a footwear e-commerce experience. Customize categories, hook up a CMS or backend, and launch fast.</p>
          <div className="mt-8 flex gap-4">
            <a href="#featured" className="rounded bg-brand-accent px-6 py-3 text-white text-sm font-medium hover:brightness-110">Shop Featured</a>
            <a href="/category/sneakers" className="rounded border border-gray-300 px-6 py-3 text-sm font-medium hover:bg-gray-100">Sneakers</a>
          </div>
        </div>
      </section>
      <div id="featured">
        <FeaturedProducts />
      </div>
    </>
  );
}
