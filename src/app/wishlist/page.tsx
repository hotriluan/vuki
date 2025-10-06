"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
// Removed static products import; fetch dynamic list from API so newly added products appear.
import { useEffect, useState } from 'react';
import { Price } from '@/components/Price';

type Product = {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  salePrice: number | null;
};

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const qs = items.length ? `?ids=${items.join(',')}` : '';
        // Use product listing API (will filter soft-deleted). If ids provided, server can filter (add support next); else fetch page and filter client side.
        const res = await fetch(`/api/products${qs}`);
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        // API returns { products, total, page, pageSize }
        if (active) setAllProducts(data.products || []);
      } catch (e) {
        if (active) setAllProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [items]);

  const list = allProducts.filter(p => items.includes(p.id));

  if (!loading && list.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <p className="text-sm text-gray-600">Bạn chưa thêm sản phẩm nào.</p>
        <Link href="/" className="inline-block rounded bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700">Khám phá sản phẩm</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <p className="text-sm text-gray-600">Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wishlist ({list.length})</h1>
        <button onClick={clear} className="text-sm text-gray-500 hover:text-gray-800">Xoá tất cả</button>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {list.map(product => {
          const image = product.images[0];
          return (
            <li key={product.id} className="group relative rounded border bg-white p-3 shadow-sm">
              <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded">
                <div className="relative aspect-[4/5] w-full">
                  {image && (
                    <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                  )}
                </div>
              </Link>
              <div className="mt-3 flex flex-col gap-1">
                <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-medium leading-snug hover:text-brand-accent">{product.name}</Link>
                <Price price={product.price} salePrice={product.salePrice ?? undefined} className="text-sm" />
              </div>
              <button onClick={() => remove(product.id)} className="absolute right-2 top-2 rounded bg-white/80 px-2 py-1 text-[10px] font-medium shadow hover:bg-white">Bỏ</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
