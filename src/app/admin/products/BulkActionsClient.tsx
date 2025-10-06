"use client";
import { useState } from 'react';

export function BulkActionsClient({ products }: { products: { id: string; name: string; slug: string; price: number; status: string; publishedAt: string | null; categories: any[]; variants: any[] }[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const all = products.map(p => p.id);
  const allSelected = selected.length === all.length && all.length > 0;

  function toggle(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }
  function toggleAll() {
    setSelected(s => s.length === all.length ? [] : all);
  }

  async function toggleStatus(productId: string, currentStatus: string) {
    setBusy(true); setError(null);
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const res = await fetch(`/api/admin/products/${productId}/toggle-status`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ status: newStatus }) 
      });
      if (!res.ok) {
        let msg = 'Không thể thay đổi status';
        try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
        setError(msg); setBusy(false); return;
      }
      window.location.reload();
    } catch (e: any) {
      setError(e?.message || 'Lỗi không xác định');
    } finally { setBusy(false); }
  }

  async function run(action: 'publish'|'unpublish'|'delete') {
    if (!selected.length) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/admin/products/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ids: selected }) });
      if (!res.ok) {
        let msg = 'Thao tác thất bại';
        try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
        setError(msg); setBusy(false); return;
      }
      // Simple reload
      window.location.reload();
    } catch (e: any) {
      setError(e?.message || 'Lỗi không xác định');
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button type="button" onClick={toggleAll} className="text-xs underline">{allSelected ? 'Bỏ chọn tất' : 'Chọn tất cả'}</button>
        <div className="flex gap-2 text-xs">
          <button disabled={!selected.length || busy} onClick={() => run('publish')} className="px-2 py-1 rounded border disabled:opacity-40">Publish</button>
          <button disabled={!selected.length || busy} onClick={() => run('unpublish')} className="px-2 py-1 rounded border disabled:opacity-40">Unpublish</button>
          <button disabled={!selected.length || busy} onClick={() => run('delete')} className="px-2 py-1 rounded border text-red-600 disabled:opacity-40">Delete</button>
        </div>
        {selected.length > 0 && <span className="text-[11px] text-gray-500">{selected.length} selected</span>}
        {busy && <span className="text-[11px] text-blue-600">Đang xử lý...</span>}
        {error && <span className="text-[11px] text-red-600">{error}</span>}
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-right">Giá</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Danh mục</th>
              <th className="p-2 text-center">Variants</th>
              <th className="p-2 text-center">Publish</th>
              <th className="p-2 text-center">Sửa</th>
              <th className="p-2 text-center">Nhân bản</th>
              <th className="p-2 text-center">Xoá</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const checked = selected.includes(p.id);
              return (
                <tr key={p.id} className={"border-t " + (checked ? 'bg-yellow-50' : 'bg-white') }>
                  <td className="p-2 text-center w-8"><input type="checkbox" checked={checked} onChange={() => toggle(p.id)} /></td>
                  <td className="p-2 max-w-[300px] truncate">{p.name}</td>
                  <td className="p-2 max-w-[200px] truncate text-gray-600 font-mono text-xs">{p.slug}</td>
                  <td className="p-2 text-right font-medium">{(p.price/1000).toLocaleString('vi-VN')}₫</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      p.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : p.status === 'DRAFT'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {p.status === 'PUBLISHED' ? 'Published' : p.status === 'DRAFT' ? 'Draft' : 'Scheduled'}
                    </span>
                  </td>
                  <td className="p-2 max-w-[150px] truncate">
                    {p.categories && p.categories.length > 0
                      ? p.categories.map((c: any) => c.category?.name || c.categoryId).join(', ')
                      : <span className="text-gray-400 italic">(Không có)</span>
                    }
                  </td>
                  <td className="p-2 text-center">{p.variants.length}</td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStatus(p.id, p.status)}
                      disabled={busy}
                      className={`text-xs px-2 py-1 rounded border disabled:opacity-40 ${
                        p.status === 'PUBLISHED' 
                          ? 'border-red-300 text-red-600 hover:bg-red-50' 
                          : 'border-green-300 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {p.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                  <td className="p-2 text-center"><a href={`/admin/products/${p.id}/edit`} className="text-blue-600 underline">Sửa</a></td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={async () => {
                        if (busy) return;
                        setBusy(true); setError(null);
                        try {
                          const res = await fetch(`/api/admin/products/${p.id}/duplicate`, { method: 'POST' });
                          if (!res.ok) {
                            let msg = 'Không thể nhân bản';
                            try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
                            setError(msg);
                          } else {
                            window.location.reload();
                          }
                        } catch (e: any) {
                          setError(e?.message || 'Lỗi không xác định');
                        } finally { setBusy(false); }
                      }}
                      className="text-indigo-600 underline disabled:opacity-40"
                      disabled={busy}
                    >Copy</button>
                  </td>
                  <td className="p-2 text-center"><form action={`/api/admin/products/${p.id}/delete`} method="POST" onSubmit={(e)=>{ if(!confirm('Xoá sản phẩm?')) e.preventDefault(); }}><button className="text-red-600 underline" type="submit">Xoá</button></form></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
