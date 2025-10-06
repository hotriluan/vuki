import { ReactNode } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Sản phẩm' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/menu', label: 'Menu & Navigation' },
  { href: '/admin/orders', label: 'Đơn hàng' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/logs', label: 'Logs' }
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-gray-50 p-4 space-y-4">
        <h2 className="font-semibold text-lg">Quản trị</h2>
        <nav className="flex flex-col gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="px-2 py-1 rounded hover:bg-gray-200 text-sm">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs text-gray-500 pt-4 border-t">Logged in: {session.user.email}</div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
