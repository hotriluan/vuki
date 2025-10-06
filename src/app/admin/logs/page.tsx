import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface SearchParams { searchParams?: { q?: string; action?: string } }

export default async function AuditLogsPage({ searchParams }: SearchParams) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') redirect('/auth/login');
  const q = searchParams?.q?.trim() || '';
  const actionFilter = searchParams?.action?.trim() || '';
  let where: any = {};
  if (q) {
    // meta JSON search naive: we'll stringify meta in memory filter later if DB doesn't support JSON path contains easily
  }
  if (actionFilter) where.action = actionFilter;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const actionsDistinct = await prisma.auditLog.findMany({
    select: { action: true },
    distinct: ['action'],
    orderBy: { action: 'asc' }
  });

  const filtered = q
    ? logs.filter(l => JSON.stringify(l.meta || {}).toLowerCase().includes(q.toLowerCase()))
    : logs;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <form className="flex flex-wrap gap-2 text-sm">
        <input type="text" name="q" defaultValue={q} placeholder="Tìm meta..." className="border rounded px-2 py-1" />
        <select name="action" defaultValue={actionFilter} className="border rounded px-2 py-1">
          <option value="">-- Tất cả actions --</option>
          {actionsDistinct.map(a => (
            <option key={a.action} value={a.action}>{a.action}</option>
          ))}
        </select>
        <button className="bg-black text-white px-3 py-1 rounded" type="submit">Lọc</button>
      </form>
      <table className="w-full text-xs border divide-y">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Thời gian</th>
            <th className="p-2 text-left">Action</th>
            <th className="p-2 text-left">Meta</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(l => (
            <tr key={l.id} className="odd:bg-white even:bg-gray-50 align-top">
              <td className="p-2 whitespace-nowrap">{l.createdAt.toISOString().slice(0,19).replace('T',' ')}</td>
              <td className="p-2 font-mono">{l.action}</td>
              <td className="p-2 max-w-[480px]"><pre className="whitespace-pre-wrap break-words text-[10px] leading-snug">{JSON.stringify(l.meta, null, 2)}</pre></td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td className="p-4 text-center text-gray-500" colSpan={3}>Không có log phù hợp.</td></tr>
          )}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-500">Hiển thị tối đa 50 mục gần nhất. Sẽ thêm pagination / JSON path search nếu cần.</p>
    </div>
  );
}
