import { z } from 'zod';

// Category schema mirrors interface but adds basic constraints
export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().min(1).nullable().optional()
});
export type CategoryParsed = z.infer<typeof CategorySchema>;

// Variant schema – either overridePrice OR priceDiff may appear (both optional)
export const VariantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  priceDiff: z.number().int().nonnegative().optional(),
  overridePrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional()
});
export type VariantParsed = z.infer<typeof VariantSchema>;

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative().optional(),
  categoryIds: z.array(z.string().min(1)).min(1),
  images: z.array(z.string().url()).min(1),
  featured: z.boolean().optional(),
  createdAt: z.string().refine(v => !Number.isNaN(Date.parse(v)), 'createdAt must be ISO date'),
  variants: z.array(VariantSchema).optional()
});
export type ProductParsed = z.infer<typeof ProductSchema>;

export const CartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  variantId: z.string().min(1).optional().nullable()
});
export type CartItemParsed = z.infer<typeof CartItemSchema>;

export function validateProductUnsafe(product: unknown) {
  return ProductSchema.parse(product);
}

export function isValidProduct(product: unknown): product is ProductParsed {
  return ProductSchema.safeParse(product).success;
}
