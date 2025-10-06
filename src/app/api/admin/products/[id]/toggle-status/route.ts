import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { invalidateAfterProductMutation } from '@/lib/invalidate';
import { logAdminAction } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try { 
    body = await req.json(); 
  } catch { 
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); 
  }

  const newStatus = body?.status;
  if (!['PUBLISHED', 'DRAFT', 'SCHEDULED'].includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const existing = await prisma.product.findUnique({ 
      where: { id: params.id }, 
      select: { id: true, name: true, status: true, publishedAt: true } 
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = { status: newStatus };
    
    // Set publishedAt when publishing, clear when unpublishing
    if (newStatus === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    } else if (newStatus === 'DRAFT' && existing.status === 'PUBLISHED') {
      updateData.publishedAt = null;
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, status: true, publishedAt: true }
    });

    // Log action
    await logAdminAction('product.status_change', {
      userId: session.user.id,
      productId: params.id,
      diff: {
        status: { before: existing.status, after: newStatus },
        publishedAt: { before: existing.publishedAt, after: updated.publishedAt }
      }
    });

    invalidateAfterProductMutation(params.id, { userId: session.user.id });
    
    return NextResponse.json({ 
      ok: true, 
      status: updated.status, 
      publishedAt: updated.publishedAt 
    });
    
  } catch (e: any) {
    return NextResponse.json({ 
      error: 'Failed to update status', 
      detail: e?.message || 'unknown' 
    }, { status: 500 });
  }
}