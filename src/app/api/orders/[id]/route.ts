import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, slug: true, name: true, stock: true }
            },
            variant: {
              select: { id: true, label: true, stock: true, priceDiff: true }
            }
          }
        },
        user: { select: { id: true, email: true, name: true } }
      }
    });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      currency: 'VND',
      createdAt: order.createdAt,
      user: order.user ? { id: order.user.id, email: order.user.email, name: order.user.name } : null,
      items: order.items.map((it: any) => ({
        id: it.id,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        product: {
          id: it.product.id,
          slug: it.product.slug,
          name: it.product.name,
          remainingStock: it.product.stock,
        },
        variant: it.variant ? {
          id: it.variant.id,
          label: it.variant.label,
          remainingStock: it.variant.stock,
          priceDiff: it.variant.priceDiff ?? 0
        } : null
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to load order', detail: e.message }, { status: 500 });
  }
}
