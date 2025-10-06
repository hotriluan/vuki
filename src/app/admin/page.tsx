import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { logAdminAction } from '@/lib/audit';

export default async function AdminHome() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/auth/login');
  const role = (session.user as any).role;
  if (role !== 'ADMIN') redirect('/auth/login');

  const [productCount, categoryCount, orderCount, userCount] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count()
  ]);

  // Lightweight recent products (5)
  const recentProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, slug: true, createdAt: true }
  });

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Đăng nhập: {session.user.email} (role: {role})</p>
        </div>
        <form action="/api/admin/rebuild-search" method="post" className="flex gap-2">
          <input type="hidden" name="secret" value={process.env.ADMIN_REBUILD_SEARCH_SECRET || process.env.ADMIN_SECRET || ''} />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded" type="submit">Rebuild Search Index</button>
        </form>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sản phẩm" value={productCount} href="/admin/products" />
        <StatCard label="Danh mục" value={categoryCount} href="/admin/categories" />
        <StatCard label="Đơn hàng" value={orderCount} href="/admin/orders" />
        <StatCard label="Người dùng" value={userCount} href="/admin/users" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sản phẩm mới nhất</h2>
        <ul className="text-sm divide-y border rounded-md bg-white">
          {recentProducts.map(p => (
            <li key={p.id} className="p-3 flex items-center justify-between">
              <span className="truncate pr-4">{p.name}</span>
              <Link href={`/admin/products/${p.id}/edit`} className="text-indigo-600 hover:underline">Sửa</Link>
            </li>
          ))}
          {recentProducts.length === 0 && <li className="p-3 text-gray-500">Chưa có sản phẩm</li>}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block rounded-md border p-4 bg-white shadow-sm hover:shadow transition">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </Link>
  );
}
