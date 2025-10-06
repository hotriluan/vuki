"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteCategoryForm({ id }: { id: string }) {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!confirm('Xác nhận xoá danh mục này?\nSản phẩm liên kết sẽ mất liên kết.')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Xoá danh mục thất bại');
      // Attempt JSON redirect pattern
      let data: any = null; try { data = await res.json(); } catch {}
      if (data?.redirect) router.push(data.redirect); else router.refresh();
    } catch (err: any) {
      alert(err.message || 'Lỗi không xác định');
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <button type="submit" disabled={submitting} className="text-red-600 text-xs hover:underline disabled:opacity-50">
        {submitting ? 'Đang xoá...' : 'Xoá'}
      </button>
    </form>
  );
}
