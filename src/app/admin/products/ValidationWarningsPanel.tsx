"use client";
import { useEffect, useState } from 'react';

interface WarningItem { productId: string; slug: string; name: string; type: string; message: string }

export function ValidationWarningsPanel() {
  const [data, setData] = useState<WarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/products/warnings');
        if (!res.ok) throw new Error('Fetch failed');
        const json = await res.json();
        if (active) setData(json.warnings || []);
      } catch (e: any) {
        if (active) setError(e?.message || 'Lỗi tải cảnh báo');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="text-xs text-gray-500">Đang kiểm tra cảnh báo…</div>;
  if (error) return <div className="text-xs text-red-600">{error}</div>;
  if (data.length === 0) return <div className="text-xs text-green-600">Không có cảnh báo nào.</div>;
  return (
    <div className="border rounded p-3 bg-amber-50/60">
      <div className="text-xs font-semibold mb-2">Cảnh báo sản phẩm ({data.length})</div>
      <ul className="space-y-1 max-h-56 overflow-auto text-xs">
        {data.map(w => (
          <li key={w.productId + w.type} className="flex justify-between gap-2">
            <span className="flex-1">
              <span className="font-medium">[{w.type}]</span> {w.name}: {w.message}
            </span>
            <a href={`/admin/products/${w.productId}/edit`} className="text-blue-600 underline shrink-0">Sửa</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
