import { prisma } from '@/lib/prisma';

export interface OrderItemInput { productId: string; variantId?: string; quantity: number; }
export interface CreateOrderResult {
  orderId: string;
  total: number;
  items: { productId: string; variantId: string | null; quantity: number; unitPrice: number }[];
  currency: string;
}

export class OrderError extends Error {
  code: string;
  meta?: any;
  constructor(code: string, message: string, meta?: any) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

export async function createOrder(items: OrderItemInput[], userId?: string): Promise<CreateOrderResult> {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new OrderError('INVALID_ITEMS', 'Items required');
  }
  if (items.length > 50) throw new OrderError('TOO_MANY_ITEMS', 'Too many items');
  const clean: OrderItemInput[] = [];
  for (const it of items) {
    if (!it || typeof it.productId !== 'string' || !it.productId) throw new OrderError('INVALID_PRODUCT_ID', 'Invalid productId');
    const qty = typeof it.quantity === 'number' ? it.quantity : 0;
    if (qty <= 0 || qty > 99) throw new OrderError('INVALID_QUANTITY', 'Invalid quantity');
    clean.push({ productId: it.productId, variantId: it.variantId, quantity: qty });
  }
  const productIds = [...new Set(clean.map(i => i.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, include: { variants: true } });
  if (products.length !== productIds.length) throw new OrderError('PRODUCT_NOT_FOUND', 'Some products not found');

  const variantMap = new Map<string, any>();
  for (const p of products) for (const v of (p as any).variants) variantMap.set(v.id, v);

  let total = 0;
  const orderItemsData: any[] = [];
  for (const it of clean) {
    const product = products.find((p: any) => p.id === it.productId)!;
    let base = product.salePrice ?? product.price;
    if (it.variantId) {
      const variant = variantMap.get(it.variantId);
      if (!variant || variant.productId !== product.id) throw new OrderError('VARIANT_MISMATCH', 'Variant mismatch');
      if (variant.priceDiff) base += variant.priceDiff;
      if (variant.stock < it.quantity) throw new OrderError('INSUFFICIENT_VARIANT_STOCK', 'Insufficient variant stock', { variantId: it.variantId });
    } else {
      if (typeof product.stock === 'number' && product.stock < it.quantity) throw new OrderError('INSUFFICIENT_PRODUCT_STOCK', 'Insufficient product stock', { productId: product.id });
    }
    total += base * it.quantity;
    orderItemsData.push({ productId: product.id, variantId: it.variantId || null, quantity: it.quantity, unitPrice: base });
  }

  const created = await prisma.$transaction(async (tx: any) => {
    // Atomic conditional decrements to avoid oversell (affected row count check)
    for (const it of clean) {
      if (it.variantId) {
        const res = await tx.productVariant.updateMany({
          where: { id: it.variantId, stock: { gte: it.quantity } },
          data: { stock: { decrement: it.quantity } }
        });
        if (res.count === 0) throw new OrderError('INSUFFICIENT_VARIANT_STOCK', 'Insufficient variant stock (race)', { variantId: it.variantId });
      } else {
        const res = await tx.product.updateMany({
          where: { id: it.productId, stock: { gte: it.quantity } },
          data: { stock: { decrement: it.quantity } }
        });
        if (res.count === 0) throw new OrderError('INSUFFICIENT_PRODUCT_STOCK', 'Insufficient product stock (race)', { productId: it.productId });
      }
    }
    const order = await tx.order.create({ data: { total, userId } });
    await tx.orderItem.createMany({ data: orderItemsData.map(oi => ({ ...oi, orderId: order.id })) });
    return order;
  });

  return { orderId: created.id, total, items: orderItemsData, currency: 'VND' };
}
