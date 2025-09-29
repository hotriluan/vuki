"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { products } from '@/lib/data';
import { Price } from '@/components/Price';

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const list = products.filter(p => items.includes(p.id));

  if (list.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <p className="text-sm text-gray-600">Bạn chưa thêm sản phẩm nào.</p>
        <Link href="/" className="inline-block rounded bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-700">Khám phá sản phẩm</Link>
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
                <Price price={product.price} salePrice={product.salePrice} className="text-sm" />
              </div>
              <button onClick={() => remove(product.id)} className="absolute right-2 top-2 rounded bg-white/80 px-2 py-1 text-[10px] font-medium shadow hover:bg-white">Bỏ</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
