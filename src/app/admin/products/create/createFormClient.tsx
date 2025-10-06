"use client";
import { useState, FormEvent, useRef } from 'react';
import dynamic from 'next/dynamic';
const VariantMatrix = dynamic(() => import('../[id]/edit/VariantMatrixClient').then(m => m.VariantMatrixClient), { ssr: false });
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface Category { id: string; name: string }
interface Props { categories: Category[] }

export default function CreateProductForm({ categories }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const variantsRef = useRef<any[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      fd.set('variantsJson', JSON.stringify(variantsRef.current || []));
      fd.set('images', images.join(', '));
      fd.set('description', description);
      const res = await fetch('/api/admin/products/create', { method: 'POST', body: fd });
      if (!res.ok) {
        let msg = 'Tạo sản phẩm thất bại';
        try { const j = await res.json(); if (j?.error) msg = j.error; if (j?.suggestedSlug) setSuggestedSlug(j.suggestedSlug); } catch {}
        setError(msg);
        setSubmitting(false);
        return;
      }
      // Redirect server responded with 307-> /admin/products, but since we used fetch, follow manually
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Lỗi không xác định');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded border border-red-200 space-y-1">
        <div>{error}</div>
        {suggestedSlug && <button type="button" onClick={()=>{ const input = (document.querySelector('input[name=slug]') as HTMLInputElement); if (input) { input.value = suggestedSlug; setSuggestedSlug(null); setError(null);} }} className="text-xs underline text-blue-600">Dùng gợi ý: {suggestedSlug}</button>}
      </div>}
      <div>
        <label className="block mb-1">Tên sản phẩm</label>
        <input name="name" required className="w-full border rounded px-3 py-2" onBlur={(e)=>{ if(!slugTouched){ const slugInput = (e.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement); if(slugInput && !slugInput.value){ slugInput.value = e.currentTarget.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-'); } } }} />
      </div>
      <div>
        <label className="block mb-1 flex justify-between"><span>Slug</span><span className="text-[10px] text-gray-500">Tự sinh nếu để trống</span></label>
        <input name="slug" className="w-full border rounded px-3 py-2" onChange={()=>{ setSlugTouched(true); setSuggestedSlug(null); }} />
      </div>
      <div>
        <label className="block mb-1">Mô tả</label>
        <RichTextEditor 
          value={description}
          onChange={setDescription}
          placeholder="Nhập mô tả chi tiết sản phẩm..."
          minHeight="150px"
        />
      </div>
      <div>
        <label className="block mb-1">Giá (VND)</label>
        <input name="price" type="number" required min={0} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block mb-1">Trạng thái</label>
        <select name="status" defaultValue="DRAFT" className="w-full border rounded px-3 py-2">
          <option value="DRAFT">Draft (Nháp)</option>
          <option value="PUBLISHED">Published (Đã xuất bản)</option>
          <option value="SCHEDULED">Scheduled (Đã lên lịch)</option>
        </select>
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input 
            name="featured" 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Sản phẩm nổi bật</span>
          <span className="text-xs text-gray-500">(Hiển thị trong mega menu và trang chủ)</span>
        </label>
      </div>
      <div>
        <label className="block mb-1">Danh mục</label>
        <select name="categoryId" required className="w-full border rounded px-3 py-2">
          <option value="">-- Chọn danh mục --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option> )}
        </select>
      </div>
      <div>
        <label className="block mb-1">Ảnh sản phẩm</label>
        <ImageUpload 
          images={images} 
          onChange={setImages}
          maxImages={10}
        />
      </div>
      <div className="border-t pt-4">
        <VariantMatrix initial={[]} onChange={(rows)=>{ variantsRef.current = rows; }} />
      </div>
      <button disabled={submitting} className="bg-black disabled:opacity-50 text-white px-4 py-2 rounded w-full" type="submit">
        {submitting ? 'Đang tạo...' : 'Tạo sản phẩm'}
      </button>
    </form>
  );
}
