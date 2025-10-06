import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateSession } from '@/lib/session';
import { createOrder, OrderError } from '@/lib/orders/createOrder';
import { withTiming } from '@/lib/apiTiming';

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
  const items = body.items;

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

  return withTiming('orders.POST', async () => {
    try {
      const result = await createOrder(items, userId);
      return NextResponse.json({
        id: result.orderId,
        total: result.total,
        currency: result.currency,
        items: result.items,
      }, { status: 201 });
    } catch (e: any) {
      if (e instanceof OrderError) {
        const statusMap: Record<string, number> = {
          INVALID_ITEMS: 400,
          TOO_MANY_ITEMS: 400,
          INVALID_PRODUCT_ID: 400,
          INVALID_QUANTITY: 400,
          PRODUCT_NOT_FOUND: 400,
          VARIANT_MISMATCH: 400,
          INSUFFICIENT_VARIANT_STOCK: 400,
          INSUFFICIENT_PRODUCT_STOCK: 400,
        };
        return NextResponse.json({ error: e.code, message: e.message, meta: e.meta }, { status: statusMap[e.code] || 400 });
      }
      return NextResponse.json({ error: 'Failed to create order', detail: e.message }, { status: 500 });
    }
  });
}
