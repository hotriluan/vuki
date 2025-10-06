"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  id: string;
  email: string;
  currentRole: 'USER' | 'ADMIN';
  self: boolean;
}

export default function UserRoleToggle({ id, email, currentRole, self }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
  const label = currentRole === 'ADMIN' ? 'Hạ quyền USER' : 'Nâng quyền ADMIN';

  async function toggle() {
    if (loading) return;
    setError(null);
    // Confirm only when promoting to ADMIN or demoting self
    if (currentRole === 'ADMIN' && nextRole === 'USER') {
      if (!confirm(`Xác nhận hạ quyền ADMIN của: ${email}?`)) return;
    } else if (nextRole === 'ADMIN') {
      if (!confirm(`Xác nhận nâng quyền ADMIN cho: ${email}?`)) return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Cập nhật thất bại');
      }
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || self && currentRole === 'ADMIN' && nextRole === 'USER';

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className="text-xs underline text-blue-600 disabled:opacity-40 disabled:no-underline"
      >
        {disabled && self && currentRole === 'ADMIN' ? 'Giữ ít nhất 1 ADMIN' : (loading ? 'Đang lưu...' : label)}
      </button>
      {error && <span className="text-[10px] text-red-600 max-w-[120px]">{error}</span>}
    </div>
  );
}
