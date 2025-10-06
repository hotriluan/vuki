// JS mirror of data.ts. Now upgraded to hit the database (Prisma) so that
// accidental resolution to .js (instead of data.ts) still returns fresh data.
// Falls back to bundled JSON only if DB call fails (e.g. during very early build).
import rawProducts from './products.json';
import { prisma } from '@/lib/prisma';

export const categories = [
	{ id: 'c-sneakers', name: 'Sneakers', slug: 'sneakers' },
	{ id: 'c-boots', name: 'Boots', slug: 'boots' },
	{ id: 'c-accessories', name: 'Accessories', slug: 'accessories' },
	{ id: 'c-limited', name: 'Limited', slug: 'limited' }
];

export function getCategories() {
	// Legacy static categories; TS version uses DB
	return categories;
}

// Static fallback snapshot (only used if DB unavailable)
export const products = (rawProducts || []).map(p => ({
	createdAt: new Date().toISOString(),
	...p
}));

export async function findProductBySlug(slug) {
	try {
			return await prisma.product.findFirst({
				where: { slug, deletedAt: null, OR: [ { status: 'PUBLISHED' }, { status: 'SCHEDULED', publishedAt: { lte: new Date() } } ] },
			include: { categories: true, variants: true }
		});
	} catch {
		return products.find(p => p.slug === slug);
	}
}
export async function getProducts() {
	try {
			return await prisma.product.findMany({
				where: { deletedAt: null, OR: [ { status: 'PUBLISHED' }, { status: 'SCHEDULED', publishedAt: { lte: new Date() } } ] },
			include: { categories: true, variants: true }
		});
	} catch {
		return products;
	}
}
export async function findCategoryBySlug(slug) {
	try {
		return await prisma.category.findUnique({ where: { slug } });
	} catch {
		return categories.find(c => c.slug === slug);
	}
}
export async function productsByCategorySlug(slug) {
	try {
		const category = await prisma.category.findUnique({ where: { slug } });
		if (!category) return [];
			return await prisma.product.findMany({
				where: { deletedAt: null, categories: { some: { categoryId: category.id } }, OR: [ { status: 'PUBLISHED' }, { status: 'SCHEDULED', publishedAt: { lte: new Date() } } ] },
			include: { categories: true, variants: true }
		});
	} catch {
		const category = categories.find(c => c.slug === slug);
		if (!category) return [];
		return products.filter(p => (p.categoryIds || []).includes(category.id));
	}
}
export async function findProductById(id) {
	try {
			return await prisma.product.findFirst({
				where: { id, deletedAt: null, OR: [ { status: 'PUBLISHED' }, { status: 'SCHEDULED', publishedAt: { lte: new Date() } } ] },
			include: { categories: true, variants: true }
		});
	} catch {
		return products.find(p => p.id === id);
	}
}
export { products as allProducts };
export default {
	categories,
	getCategories,
	products,
	getProducts,
	findProductBySlug,
	findCategoryBySlug,
	productsByCategorySlug,
	findProductById
};
