import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

const STATUS_LABEL: Record<string,string> = {
  PENDING: 'Chờ xử lý',
  PAID: 'Đã thanh toán',
  FULFILLED: 'Hoàn tất',
  CANCELLED: 'Hủy'
};

export default async function OrdersPage() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  const h = headers();
  const url = h.get('x-url') || ''; // fallback nếu có middleware thiết lập
  let statusFilter: string | null = null;
  try {
    if (url) {
      const u = new URL(url);
      const s = u.searchParams.get('status');
      if (s && Object.keys(STATUS_LABEL).includes(s)) statusFilter = s;
    }
  } catch {/* ignore */}

  const where: any = statusFilter ? { status: statusFilter } : {};
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true } },
      items: { include: { product: { select: { name: true } }, variant: { select: { label: true } } } }
    }
  });

  // Thống kê
  const totalOrders = orders.length;
  const totalItems = orders.reduce((acc, o) => acc + o.items.reduce((a, it) => a + it.quantity, 0), 0);
  const revenuePaid = orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.total, 0);
  const revenueFulfilled = orders.filter(o => o.status === 'FULFILLED').reduce((sum, o) => sum + o.total, 0);
  const revenueActive = revenuePaid + revenueFulfilled; // tổng doanh thu theo yêu cầu (PAID + FULFILLED)
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Đơn hàng</h1>
        <form method="get" className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Trạng thái:</label>
          <select name="status" defaultValue={statusFilter || ''} className="border rounded px-2 py-1 text-sm">
            <option value="">Tất cả</option>
            {Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button className="bg-black text-white px-3 py-1 rounded" type="submit">Lọc</button>
          {statusFilter && (
            <a href="/admin/orders" className="text-xs text-gray-500 underline">Reset</a>
          )}
        </form>
      </div>

      <div className="grid md:grid-cols-4 gap-4 text-sm">
        <div className="p-3 border rounded bg-white">
          <div className="text-gray-500 text-xs uppercase">Tổng đơn</div>
          <div className="text-lg font-semibold">{totalOrders}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-gray-500 text-xs uppercase">Tổng items</div>
          <div className="text-lg font-semibold">{totalItems}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-gray-500 text-xs uppercase">Doanh thu (PAID + FULF.)</div>
          <div className="text-lg font-semibold">{revenueActive.toLocaleString('vi-VN')}</div>
          <div className="text-[10px] text-gray-400">PAID: {revenuePaid.toLocaleString('vi-VN')} / FULF: {revenueFulfilled.toLocaleString('vi-VN')}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-gray-500 text-xs uppercase">Lọc hiện tại</div>
          <div className="text-lg font-semibold">{statusFilter ? STATUS_LABEL[statusFilter] : 'Tất cả'}</div>
        </div>
      </div>
      <table className="w-full text-sm border divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Mã</th>
            <th className="p-2 text-left">Khách</th>
            <th className="p-2 text-left">Sản phẩm</th>
            <th className="p-2 text-left">Tổng (VND)</th>
            <th className="p-2 text-left">Trạng thái</th>
            <th className="p-2 text-left">Cập nhật</th>
            <th className="p-2 text-left">Tạo lúc</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="odd:bg-white even:bg-gray-50 align-top">
              <td className="p-2 font-mono text-xs">{o.id.slice(0,8)}</td>
              <td className="p-2">{o.user?.email || 'Ẩn danh'}</td>
              <td className="p-2 space-y-1">
                {o.items.map(it => (
                  <div key={it.id} className="leading-tight">
                    <span>{it.product.name}</span>
                    {it.variant && <span className="text-xs text-gray-500"> ({it.variant.label})</span>} x{it.quantity}
                  </div>
                ))}
              </td>
              <td className="p-2">{o.total.toLocaleString('vi-VN')}</td>
              <td className="p-2 text-xs">
                <span className="inline-block px-2 py-1 rounded bg-gray-200">{STATUS_LABEL[o.status]}</span>
              </td>
              <td className="p-2">
                <form method="post" action={`/api/admin/orders/${o.id}/status`} className="flex gap-1 items-center text-xs">
                  <select name="status" defaultValue={o.status} className="border rounded px-1 py-0.5 text-xs">
                    {Object.keys(STATUS_LABEL).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                  <button type="submit" className="bg-black text-white px-2 py-1 rounded">Lưu</button>
                </form>
              </td>
              <td className="p-2 text-xs">{o.createdAt.toISOString().slice(0,16).replace('T',' ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
