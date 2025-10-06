import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserRoleToggle from './UserRoleToggle';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');

  const users: any[] = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const adminCount = users.filter(u => (u as any).role === 'ADMIN').length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Người dùng</h1>
      <p className="text-sm text-gray-600">Tổng: {users.length} • Admin: {adminCount}</p>
      <table className="w-full text-sm border divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Tạo lúc</th>
            <th className="p-2 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => {
            const self = u.email === session.user.email;
            return (
              <tr key={u.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 font-mono text-xs">{u.email}</td>
                <td className="p-2">{u.name || '-'}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 text-xs">{u.createdAt.toISOString().slice(0,19).replace('T',' ')}</td>
                <td className="p-2"><UserRoleToggle id={u.id} email={u.email} currentRole={u.role as any} self={self} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[11px] text-gray-500">Không thể hạ quyền nếu đây là ADMIN duy nhất (tránh mất quyền quản trị).</p>
    </div>
  );
}
