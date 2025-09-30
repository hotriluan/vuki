// Advanced search with external JSON index & Fuse fuzzy tuning
import type { Product } from './types';
// NOTE: CI/server fallback: nếu chạy trong môi trường Node (không có window)
// ta đọc trực tiếp file public/search-index.json bằng fs để tránh lỗi fetch relative URL.

interface UnifiedIndexItem { id: string; slug: string; name: string; description: string; featured?: boolean; type: 'product' | 'blog'; }

let fuseInstance: any = null;
let fusePromise: Promise<any> | null = null;
let indexData: UnifiedIndexItem[] | null = null;
let indexPromise: Promise<UnifiedIndexItem[]> | null = null;

async function buildInMemoryIndex(): Promise<UnifiedIndexItem[]> {
  // Lazy import to avoid cost if file exists
  try {
    const { products } = await import('./data');
    let blogPosts: any[] = [];
    try {
      const blog = await import('./blog');
      blogPosts = (blog.getAllPosts ? blog.getAllPosts() : []).map((b: any) => ({
        id: `blog:${b.slug}`,
        type: 'blog' as const,
        name: b.title,
        description: (b.excerpt || '').slice(0, 400),
        slug: b.slug
      }));
      // Retry một lần nếu rỗng nhưng có thư mục posts (tránh timing cache rỗng ban đầu)
      if (blogPosts.length === 0) {
        try {
          if (typeof process !== 'undefined') {
            const path = await import('path');
            const fs = await import('fs');
            const postsDir = path.join(process.cwd(), 'content', 'posts');
            if (fs.existsSync(postsDir)) {
              // Invalidate cache nếu lib hỗ trợ
              if (typeof (blog as any).__resetBlogCache === 'function') {
                (blog as any).__resetBlogCache();
                const retry = blog.getAllPosts ? blog.getAllPosts() : [];
                blogPosts = retry.map((b: any) => ({
                  id: `blog:${b.slug}`,
                  type: 'blog' as const,
                  name: b.title,
                  description: (b.excerpt || '').slice(0, 400),
                  slug: b.slug
                }));
              }
            }
          }
        } catch {}
      }
    } catch (e) {
      // blog optional
    }
    // Nếu vẫn rỗng, không block index – vẫn trả product records.
    const productRecords: UnifiedIndexItem[] = products.map((p: any) => ({
      id: p.id,
      type: 'product',
      name: p.name,
      description: String(p.description || '').slice(0, 400),
      slug: p.slug,
      featured: !!p.featured
    }));
    return [...productRecords, ...blogPosts];
  } catch (e) {
    return [];
  }
}

async function loadIndex(): Promise<UnifiedIndexItem[]> {
  if (indexData) return indexData;
  // Server / test environment
  if (typeof window === 'undefined') {
    if (!indexPromise) {
      indexPromise = (async (): Promise<UnifiedIndexItem[]> => {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const filePath = path.join(process.cwd(), 'public', 'search-index.json');
          const raw = await fs.readFile(filePath, 'utf8');
          indexData = JSON.parse(raw);
          if (!Array.isArray(indexData) || indexData.length === 0) {
            // build in-memory if empty
            indexData = await buildInMemoryIndex();
          }
        } catch (err) {
          console.error('[search] Failed to read search-index.json (fs fallback)', err);
          // Build ephemeral index so tests (blog search) still work
            indexData = await buildInMemoryIndex();
        }
        return indexData || [];
      })();
    }
    return indexPromise;
  }
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json', { cache: 'force-cache' })
      .then(r => {
        // Some test mocks may not provide ok; assume success if json function exists
        if (typeof (r as any).json === 'function' && (r as any).ok === undefined) return r;
        return (r as any).ok ? r : Promise.reject(new Error('Failed to fetch search-index.json'));
      })
      .then(r => (r as any).json())
      .then(async d => {
        indexData = d;
        if (!Array.isArray(indexData) || indexData.length === 0) {
          indexData = await buildInMemoryIndex();
        }
        return indexData;
      })
      .catch(async err => { 
        console.error('[search] fetch error', err); 
        indexData = await buildInMemoryIndex(); 
        return indexData; 
      });
  }
  return indexPromise;
}

async function buildFuse() {
  const [{ default: Fuse }, data] = await Promise.all([
    import('fuse.js'),
    loadIndex()
  ]);
  return new Fuse(data, {
    keys: [
      { name: 'name', weight: 0.55 },
      { name: 'description', weight: 0.25 },
      // Give slug slightly more weight than before for fuzzy corrections
      { name: 'slug', weight: 0.20 }
    ],
    threshold: 0.42, // a bit more tolerant
    distance: 120,   // allow some transposition / typos further apart
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true
  });
}

export async function ensureSearchReady() {
  if (fuseInstance) return fuseInstance;
  if (!fusePromise) fusePromise = buildFuse().then(f => (fuseInstance = f));
  return fusePromise;
}

export interface SearchResultItem {
  product: UnifiedIndexItem | (Product & { type?: 'product' });
  highlights: { key: string; value: string; indices: Array<[number, number]> }[];
}

export async function ensureIndexLoad() {
  await loadIndex();
}

export async function searchProducts(query: string, limit = 8): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const fuse = await ensureSearchReady();
  const res = fuse.search(trimmed, { limit: limit * 2 }); // nới rộng rồi sẽ cắt sau boost
  // Boost nhẹ sản phẩm để ưu tiên sản phẩm thương mại nhưng vẫn giữ blog liên quan
  const scored = res.map((r: any) => {
    let score = r.score ?? 0;
    const item: UnifiedIndexItem = r.item;
    if (item.type === 'product') score *= 0.9; // giảm 10% score (tốt hơn)
    else if (item.type === 'blog') {
      // blog mới (<=30 ngày) boost nhẹ
      const now = Date.now();
      // publishedAt không nằm trong unified item nhưng có thể được embed tương lai, tạm bỏ qua
      score *= 1.02;
    }
    return { ...r, adjScore: score };
  });
  scored.sort((a: any, b: any) => a.adjScore - b.adjScore);
  return scored.slice(0, limit).map((r: any) => ({
    product: r.item as UnifiedIndexItem,
    highlights: (r.matches || []).map((m: any) => ({
      key: m.key as string,
      value: String(m.value),
      indices: m.indices as Array<[number, number]>
    }))
  }));
}
