// Utilities for generating and suggesting unique slugs for products (and potentially other models)
import { prisma } from './prisma';

export function slugify(input: string) {
  return input.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Generate a unique suggestion by appending numeric suffix if needed.
export async function suggestUniqueProductSlug(base: string, maxTries = 20): Promise<string> {
  let root = slugify(base);
  if (!root) root = 'san-pham';
  // If base itself unused, fast path
  const existing = await prisma.product.findUnique({ where: { slug: root }, select: { id: true } });
  if (!existing) return root;
  for (let i = 2; i <= maxTries + 1; i++) {
    const candidate = `${root}-${i}`;
    const found = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!found) return candidate;
  }
  // Fallback: timestamp suffix
  return `${root}-${Date.now()}`;
}
