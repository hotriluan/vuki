import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createOrder, OrderError } from '@/lib/orders/createOrder';

// Helper to create test product & variant
async function seedBasic() {
  const product = await prisma.product.create({
    data: {
      slug: 'test-product',
      name: 'Test Product',
      description: 'A test product',
      price: 1000,
      images: [],
      stock: 10,
      variants: {
        create: [
          { label: 'Size 42', stock: 5 },
          { label: 'Size 43', stock: 1, priceDiff: 200 }
        ]
      }
    },
    include: { variants: true }
  });
  return product;
}

async function resetDB() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
}

describe('orders integration', () => {
  beforeAll(async () => {
    await resetDB();
    await seedBasic();
  });
  afterAll(async () => {
    await resetDB();
  });

  it('creates order (product only) and decrements product stock', async () => {
    const product = await prisma.product.findFirstOrThrow({ where: { slug: 'test-product' } });
    const before = product.stock;
    const result = await createOrder([{ productId: product.id, quantity: 2 }]);
    expect(result.total).toBe(2000);
    const after = await prisma.product.findUnique({ where: { id: product.id } });
    expect(after!.stock).toBe(before - 2);
  });

  it('creates order with variant and decrements variant stock only', async () => {
    const product = await prisma.product.findFirstOrThrow({ where: { slug: 'test-product' }, include: { variants: true } });
    const variant = product.variants[0];
    const beforeVariant = variant.stock;
    const beforeProduct = product.stock;
    const result = await createOrder([{ productId: product.id, variantId: variant.id, quantity: 1 }]);
    expect(result.total).toBeGreaterThan(0);
    const variantAfter = await prisma.productVariant.findUnique({ where: { id: variant.id } });
    const productAfter = await prisma.product.findUnique({ where: { id: product.id } });
    expect(variantAfter!.stock).toBe(beforeVariant - 1);
    expect(productAfter!.stock).toBe(beforeProduct); // product stock không giảm khi mua variant
  });

  it('fails when variant stock insufficient', async () => {
    const product = await prisma.product.findFirstOrThrow({ where: { slug: 'test-product' }, include: { variants: true } });
    const scarce = product.variants.find(v => v.stock === 1) || product.variants[1];
    await expect(createOrder([{ productId: product.id, variantId: scarce.id, quantity: scarce.stock + 1 }]))
      .rejects.toMatchObject({ code: 'INSUFFICIENT_VARIANT_STOCK' });
  });

  it('fails when product stock insufficient (no variant)', async () => {
    const product = await prisma.product.findFirstOrThrow({ where: { slug: 'test-product' } });
    await expect(createOrder([{ productId: product.id, quantity: product.stock + 10 }]))
      .rejects.toMatchObject({ code: 'INSUFFICIENT_PRODUCT_STOCK' });
  });

  it('prevents over-selling across sequential orders', async () => {
    const product = await prisma.product.findFirstOrThrow({ where: { slug: 'test-product' } });
    // Ensure current stock small for test
    await prisma.product.update({ where: { id: product.id }, data: { stock: 3 } });
    const p = await prisma.product.findUnique({ where: { id: product.id } });
    expect(p!.stock).toBe(3);
    const ok = await createOrder([{ productId: product.id, quantity: 2 }]);
    expect(ok.total).toBe(2 * (p!.salePrice ?? p!.price));
    const after = await prisma.product.findUnique({ where: { id: product.id } });
    expect(after!.stock).toBe(1);
    // Attempt exceed
    await expect(createOrder([{ productId: product.id, quantity: 2 }]))
      .rejects.toMatchObject({ code: 'INSUFFICIENT_PRODUCT_STOCK' });
  });
});
