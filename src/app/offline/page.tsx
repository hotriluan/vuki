export const metadata = { title: 'Offline - Vuki' };

// Simple offline page: attempts to load precached products JSON for basic browsing fallback.
export default async function OfflinePage() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-center space-y-6">
      <h1 className="text-2xl font-semibold">Bạn đang offline</h1>
      <p className="text-sm text-gray-600">Một số chức năng bị hạn chế. Dưới đây là danh sách sản phẩm cơ bản đã được lưu tạm.</p>
      <OfflineProducts />
      <p className="text-xs text-gray-400">Kết nối lại để xem thông tin mới nhất.</p>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
interface P { id: string; name: string; slug: string; price: number; salePrice?: number; images?: string[] }
function OfflineProducts() {
  const [products, setProducts] = useState<P[] | null>(null);
  useEffect(() => {
    let mounted = true;
    fetch('/products-precache.json').then(r => r.json()).then(d => { if (mounted) setProducts(d.products || []); }).catch(() => setProducts([]));
    return () => { mounted = false; };
  }, []);
  if (!products) return <div className="animate-pulse text-sm text-gray-500">Đang tải dữ liệu cục bộ...</div>;
  if (products.length === 0) return <div className="text-sm text-gray-500">Không có dữ liệu offline.</div>;
  return (
    <ul className="grid grid-cols-2 gap-4 text-left">
      {products.map(p => (
        <li key={p.id} className="border rounded p-2 flex flex-col gap-1 bg-white/60">
          <span className="font-medium text-sm line-clamp-2">{p.name}</span>
          <span className="text-[11px] text-gray-500">{(p.salePrice ?? p.price).toLocaleString('vi-VN')}₫</span>
        </li>
      ))}
    </ul>
  );
}
