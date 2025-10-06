"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteProductForm({ id }: { id: string }) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const onSubmit = async (e: FormEvent) => {
    if (!confirm('Xác nhận xoá mềm sản phẩm này?')) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Xoá thất bại');
      let data: any = null; try { data = await res.json(); } catch {}
      if (data?.redirect) router.push(data.redirect);
      else router.refresh();
    } catch (err) {
      alert((err as Error).message || 'Lỗi không xác định');
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={onSubmit}>
      <button disabled={submitting} type="submit" className="text-red-600 hover:underline text-xs disabled:opacity-50">
        {submitting ? 'Đang xoá...' : 'Xoá'}
      </button>
    </form>
  );
}
