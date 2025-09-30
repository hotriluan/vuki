// Advanced search with external JSON index & Fuse fuzzy tuning
import type { Product } from './types';
// NOTE: CI/server fallback: nếu chạy trong môi trường Node (không có window)
// ta đọc trực tiếp file public/search-index.json bằng fs để tránh lỗi fetch relative URL.

interface UnifiedIndexItem { id: string; slug: string; name: string; description: string; featured?: boolean; type: 'product' | 'blog'; }

let fuseInstance: any = null;
let fusePromise: Promise<any> | null = null;
let indexData: UnifiedIndexItem[] | null = null;
let indexPromise: Promise<UnifiedIndexItem[]> | null = null;

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
        } catch (err) {
          console.error('[search] Failed to read search-index.json (fs fallback)', err);
          indexData = [];
        }
        return indexData || [];
      })();
    }
    return indexPromise;
  }
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json', { cache: 'force-cache' })
      .then(r => (r.ok ? r : Promise.reject(new Error('Failed to fetch search-index.json'))))
      .then(r => r.json())
      .then(d => (indexData = d))
      .catch(err => { console.error('[search] fetch error', err); return (indexData = []); });
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
