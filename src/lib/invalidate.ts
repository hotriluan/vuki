import { revalidatePath } from 'next/cache';
import { buildUnifiedSearchRecords, writeUnifiedSearchIndex } from './searchBuild';
import { logAdminAction } from './audit';
import { prisma } from './prisma';

// Fire-and-forget search index rebuild
export async function triggerSearchRebuild(userId?: string) {
  try {
    // Run in background without blocking response
    setTimeout(async () => {
      try {
        const result = await buildUnifiedSearchRecords();
        writeUnifiedSearchIndex(result.records, process.cwd(), {
          version: result.version,
            generatedAt: result.generatedAt,
            counts: result.counts
        });
        revalidatePath('/search-index.json');
  // Audit action omitted (no AuditAction enum value yet). Add when model extended.
      } catch (e) {
        console.error('[invalidate] search rebuild failed', e);
      }
    }, 10);
  } catch {}
}

export async function invalidateAfterProductMutation(productId: string, opts: { previousSlug?: string; userId?: string } = {}) {
  try {
    const prod = await prisma.product.findUnique({
      where: { id: productId },
      include: { categories: { include: { category: true } } }
    });
    if (prod) {
      // Revalidate each category page product belongs to
      for (const pc of prod.categories) {
        revalidatePath(`/category/${pc.category.slug}`);
      }
      // Product detail (if route changed slug we also invalidate old one)
      revalidatePath(`/product/${prod.slug}`);
      if (opts.previousSlug && opts.previousSlug !== prod.slug) {
        revalidatePath(`/product/${opts.previousSlug}`);
      }
    }
    // Global pages
    revalidatePath('/');
    revalidatePath('/sitemap.xml');
    triggerSearchRebuild(opts.userId);
  } catch (e) {
    console.error('[invalidate] product mutation invalidate failed', e);
  }
}

export async function invalidateAfterCategoryMutation(slug: string) {
  try {
    revalidatePath(`/category/${slug}`);
    revalidatePath('/sitemap.xml');
  } catch (e) {
    console.error('[invalidate] category invalidate failed', e);
  }
}
