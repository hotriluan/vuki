import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';

const ALLOWED = new Set(['PENDING','PAID','FULFILLED','CANCELLED']);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') return NextResponse.redirect('/auth/login');
  const form = await req.formData();
  const status = form.get('status') as string;
  if (!ALLOWED.has(status)) return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
  const order = await prisma.order.findUnique({ where: { id: params.id }, select: { id: true, status: true } });
  if (!order) return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
  if (order.status === status) return NextResponse.redirect('/admin/orders');
  await prisma.order.update({ where: { id: params.id }, data: { status: status as any } });
  await logAdminAction('order.status.update', { orderId: params.id, from: order.status, to: status, userId: session.user.id });
  return NextResponse.redirect('/admin/orders');
}
