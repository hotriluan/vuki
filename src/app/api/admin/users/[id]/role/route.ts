import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions as any);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
  const newRole = body?.role;
  if (!['USER', 'ADMIN'].includes(newRole)) {
    return NextResponse.json({ message: 'Role không hợp lệ' }, { status: 400 });
  }
  if (session.user.id === id && newRole !== 'ADMIN') {
    return NextResponse.json({ message: 'Không thể tự hạ quyền nếu đang là ADMIN hiện tại.' }, { status: 400 });
  }
  // Đảm bảo còn ít nhất 1 admin
  if (newRole === 'USER') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' as any } });
    const target = await prisma.user.findUnique({ where: { id } });
    if (target && (target as any).role === 'ADMIN' && adminCount <= 1) {
      return NextResponse.json({ message: 'Phải giữ ít nhất 1 ADMIN.' }, { status: 400 });
    }
  }
  try {
    const updated = await prisma.user.update({ where: { id }, data: { role: newRole as any } });
    await logAdminAction('user.role.update', { by: session.user.email, target: updated.email, newRole });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ message: 'Cập nhật thất bại' }, { status: 500 });
  }
}
