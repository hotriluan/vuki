import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateSession } from '@/lib/session';

interface OrderItemInput { productId: string; variantId?: string; quantity: number; }
interface CreateOrderBody { items: OrderItemInput[] }

// Deprecated header fallback – sẽ bỏ dần
function getLegacyUserId(req: Request): string | null {
  const header = req.headers.get('x-user-id');
  return header || null;
}

export async function POST(req: Request) {
  let body: CreateOrderBody;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Items required' }, { status: 400 });
  }
  if (body.items.length > 50) return NextResponse.json({ error: 'Too many items' }, { status: 400 });

  const clean: OrderItemInput[] = [];
  for (const it of body.items) {
    if (!it || typeof it.productId !== 'string' || !it.productId) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }
    const qty = typeof it.quantity === 'number' ? it.quantity : 0;
    if (qty <= 0 || qty > 99) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    clean.push({ productId: it.productId, variantId: it.variantId, quantity: qty });
  }

  // Fetch products & variants
  const productIds = [...new Set(clean.map(i => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true }
  });
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Some products not found' }, { status: 400 });
  }

  const variantMap = new Map<string, any>();
  for (const p of products) {
    for (const v of p.variants as any[]) variantMap.set(v.id, v);
  }

  // Price calculation
  let total = 0;
  const orderItemsData: any[] = [];
  for (const it of clean) {
    const product = products.find((p: any) => p.id === it.productId)!;
    let base = product.salePrice ?? product.price;
    if (it.variantId) {
      const variant = variantMap.get(it.variantId);
      if (!variant || variant.productId !== product.id) {
        return NextResponse.json({ error: 'Variant mismatch' }, { status: 400 });
      }
      if (variant.priceDiff) base += variant.priceDiff;
      // Stock check for variant
      if (variant.stock < it.quantity) {
        return NextResponse.json({ error: 'Insufficient variant stock', variantId: it.variantId }, { status: 400 });
      }
    }
    // Product-level stock check only when no variant used
    if (!it.variantId) {
      if (typeof product.stock === 'number' && product.stock < it.quantity) {
        return NextResponse.json({ error: 'Insufficient product stock', productId: product.id }, { status: 400 });
      }
    }
    const lineTotal = base * it.quantity;
    total += lineTotal;
    orderItemsData.push({
      productId: product.id,
      variantId: it.variantId || null,
      quantity: it.quantity,
      unitPrice: base
    });
  }

  // Session cookie (anon user nếu chưa có). Nếu vẫn còn header cũ thì ưu tiên header (debug) nhưng sẽ bỏ.
  let userId: string | undefined;
  try {
    const legacy = getLegacyUserId(req);
    if (legacy) userId = legacy;
    else {
      const sess = await getOrCreateSession();
      userId = sess.userId;
    }
  } catch (e) {
    // Nếu session subsystem lỗi, vẫn cho tạo đơn không user (giảm gián đoạn) – có thể siết lại sau
    userId = undefined;
  }

  try {
  const created = await prisma.$transaction(async (tx: any) => {
      // Decrement stocks first
      for (const it of clean) {
        if (it.variantId) {
          await tx.productVariant.update({
            where: { id: it.variantId },
            data: { stock: { decrement: it.quantity } }
          });
        } else {
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { decrement: it.quantity } }
          });
        }
      }
  const order = await tx.order.create({ data: { total, userId } });
      await tx.orderItem.createMany({ data: orderItemsData.map(oi => ({ ...oi, orderId: order.id })) });
      return order;
    });

    return NextResponse.json({
      id: created.id,
      total,
      currency: 'VND',
      items: orderItemsData.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, unitPrice: i.unitPrice })),
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create order', detail: e.message }, { status: 500 });
  }
}
