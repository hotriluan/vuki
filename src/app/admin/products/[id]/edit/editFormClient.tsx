"use client";
import { useState, FormEvent, useRef } from 'react';
import dynamic from 'next/dynamic';
const VariantMatrix = dynamic(() => import('./VariantMatrixClient').then(m => m.VariantMatrixClient), { ssr: false });
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface Category { id: string; name: string }
interface Variant { id: string; label: string; stock: number; priceDiff?: number | null; overridePrice?: number | null }
interface Product { id: string; name: string; slug: string; description: string; price: number; status?: string; images: any[]; categories: any[]; variants?: Variant[]; updatedAt?: string }
interface Props { product: Product; categories: Category[] }

export default function EditProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [conflictInfo, setConflictInfo] = useState<{ updatedAt: string; slug?: string } | null>(null);
  const [willForce, setWillForce] = useState(false);
  const [currentUpdatedAt, setCurrentUpdatedAt] = useState((product as any).updatedAt || '');
  const [forceFlag, setForceFlag] = useState('0');
  const [images, setImages] = useState<string[]>(product.images || []);
  const [description, setDescription] = useState(product.description || '');
  const variantsRef = useRef<any[]>( (product.variants||[]).map(v => ({ id: v.id, label: v.label, stock: v.stock, priceDiff: v.priceDiff, overridePrice: (v as any).overridePrice ?? null })) );

  // Variant matrix now handles editing variants; legacy textarea removed.

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    
    try {
      // Inject variants JSON before sending
      fd.set('variantsJson', JSON.stringify(variantsRef.current || []));
      // Override with state values to ensure correct data
      fd.set('updatedAt', currentUpdatedAt);
      fd.set('forceOnConflict', forceFlag);
      // Set images from state
      fd.set('images', images.join(', '));
      // Set description from state
      fd.set('description', description);
      
      const res = await fetch(`/api/admin/products/${product.id}/edit`, { method: 'POST', body: fd });
      if (!res.ok) {
        let msg = 'Cập nhật thất bại';
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
          if (j?.suggestedSlug) setSuggestedSlug(j.suggestedSlug);
        } catch {}
        setError(msg);
        setSubmitting(false);
        return;
      }
      // Success: clear conflict state before redirect
      setConflictInfo(null);
      setWillForce(false);
      setForceFlag('0');
      setError(null);
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Lỗi không xác định');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {(error || conflictInfo) && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded border border-red-200 space-y-1">
        {error && <div>{error}</div>}
        {conflictInfo && (
          <div className="text-[11px] space-y-1">
            <p>Phiên bản sản phẩm đã thay đổi. Timestamp mới đã được cập nhật.</p>
            <p>{willForce ? 'Lần lưu tiếp theo sẽ ghi đè thay đổi phát sinh sau phiên bản này.' : 'Bấm "Lưu thay đổi" lần nữa để áp dụng.'}</p>
            {conflictInfo.slug && <p className="text-gray-600">Slug hiện tại: <code>{conflictInfo.slug}</code></p>}
          </div>
        )}
        {suggestedSlug && <button type="button" onClick={()=>{ const input = (document.querySelector('input[name=slug]') as HTMLInputElement); if (input) { input.value = suggestedSlug; setSuggestedSlug(null); setError(null);} }} className="text-xs underline text-blue-600">Dùng gợi ý: {suggestedSlug}</button>}
      </div>}
      <input type="hidden" name="updatedAt" value={currentUpdatedAt} />
      <input type="hidden" name="forceOnConflict" value={forceFlag} />
      <div>
        <label className="block mb-1">Tên sản phẩm</label>
        <input name="name" defaultValue={product.name} required className="w-full border rounded px-3 py-2" onBlur={(e)=>{ if(!slugTouched){ const slugInput = (e.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement); if(slugInput && !slugInput.value){ slugInput.value = e.currentTarget.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-'); } } }} />
      </div>
      <div>
        <label className="block mb-1 flex justify-between"><span>Slug</span><span className="text-[10px] text-gray-500">Tự sinh nếu trống</span></label>
        <input name="slug" defaultValue={product.slug} className="w-full border rounded px-3 py-2" onChange={()=>{ setSlugTouched(true); setSuggestedSlug(null); }} />
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
        <input name="price" type="number" defaultValue={product.price} required min={0} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block mb-1">Trạng thái</label>
        <select name="status" defaultValue={product.status || 'DRAFT'} className="w-full border rounded px-3 py-2">
          <option value="DRAFT">Draft (Nháp)</option>
          <option value="PUBLISHED">Published (Đã xuất bản)</option>
          <option value="SCHEDULED">Scheduled (Đã lên lịch)</option>
        </select>
      </div>
      <div>
        <label className="block mb-1">Danh mục</label>
        <select name="categoryId" required className="w-full border rounded px-3 py-2" defaultValue={product.categories[0]?.categoryId}>
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
      {/* Variant matrix inline editing */}
      <div className="border-t pt-4">
        {/* Dynamically imported client matrix */}
        <VariantMatrix
          productId={product.id}
          initial={(product.variants||[]).map(v => ({ id: v.id, label: v.label, stock: v.stock, priceDiff: v.priceDiff, overridePrice: (v as any).overridePrice ?? null }))}
          onChange={(rows) => { variantsRef.current = rows; }}
        />
      </div>
      <button disabled={submitting} className="bg-black disabled:opacity-50 text-white px-4 py-2 rounded w-full" type="submit">
        {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}
