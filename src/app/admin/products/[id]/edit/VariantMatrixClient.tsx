"use client";
import { useState, useEffect } from 'react';

interface VariantRow { id?: string; label: string; stock: number; priceDiff?: number | null; overridePrice?: number | null }

export function VariantMatrixClient({ productId, initial, onChange }: { productId?: string; initial: VariantRow[]; onChange?: (rows: VariantRow[]) => void }) {
  const [rows, setRows] = useState<VariantRow[]>(initial);
  useEffect(() => { onChange?.(rows); }, [rows, onChange]);

  function update(index: number, patch: Partial<VariantRow>) {
    setRows(r => r.map((row, i) => i === index ? { ...row, ...patch } : row));
  }
  function remove(index: number) { setRows(r => r.filter((_, i) => i !== index)); }
  function add() { setRows(r => [...r, { label: '', stock: 0 }]); }
  // Integrated mode: no independent persist here; parent form will submit everything.

  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Variants</h2>
        <div className="flex gap-2">
          <button type="button" onClick={add} className="text-xs px-2 py-1 rounded border">+ Thêm dòng</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left font-medium">Label</th>
              <th className="p-2 text-left font-medium w-20">Stock</th>
              <th className="p-2 text-left font-medium w-28">PriceDiff</th>
              <th className="p-2 text-left font-medium w-32">Override</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Chưa có variant</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id || i} className="border-t">
                <td className="p-1">
                  <input value={row.label} onChange={e => update(i, { label: e.target.value })} placeholder="Size 40" className="w-full border rounded px-2 py-1" />
                </td>
                <td className="p-1">
                  <input type="number" min={0} value={row.stock} onChange={e => update(i, { stock: parseInt(e.target.value || '0', 10) })} className="w-full border rounded px-2 py-1" />
                </td>
                <td className="p-1">
                  <input type="number" value={row.priceDiff ?? ''} onChange={e => update(i, { priceDiff: e.target.value === '' ? null : parseInt(e.target.value, 10) })} className="w-full border rounded px-2 py-1" />
                </td>
                <td className="p-1">
                  <input type="number" value={row.overridePrice ?? ''} onChange={e => update(i, { overridePrice: e.target.value === '' ? null : parseInt(e.target.value, 10) })} className="w-full border rounded px-2 py-1" />
                </td>
                <td className="p-1 text-right">
                  <button type="button" onClick={() => remove(i)} className="text-red-600 hover:underline">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-500">Lưu ý: Ô Override nếu có giá trị sẽ bỏ qua PriceDiff ở tầng hiển thị.</p>
    </div>
  );
}
