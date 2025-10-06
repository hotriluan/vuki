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
  id: z.string().min(1).optional(), // DB may not include id for newly parsed variants
  label: z.string().min(1),
  priceDiff: z.number().int().optional().nullable(),
  overridePrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional().nullable()
});
export type VariantParsed = z.infer<typeof VariantSchema>;

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative().nullable().optional(),
  // Some code paths may not set categoryIds; allow empty + compute elsewhere
  categoryIds: z.array(z.string().min(1)).optional(),
  images: z.array(z.string()).min(1), // allow relative or non-URL dev paths
  primaryImage: z.string().min(1).optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(['DRAFT','PUBLISHED','SCHEDULED']).optional(),
  publishedAt: z.union([
    z.string().refine(v => !v || !Number.isNaN(Date.parse(v)), 'publishedAt must be ISO date'),
    z.date()
  ]).nullable().optional(),
  createdAt: z.union([
    z.string().refine(v => !Number.isNaN(Date.parse(v)), 'createdAt must be ISO date'),
    z.date()
  ]),
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
