// Advanced search with external JSON index & Fuse fuzzy tuning
import type { Product } from './types';

interface IndexProductPick { id: string; slug: string; name: string; description: string; featured?: boolean; }

let fuseInstance: any = null;
let fusePromise: Promise<any> | null = null;
let indexData: IndexProductPick[] | null = null;
let indexPromise: Promise<IndexProductPick[]> | null = null;

async function loadIndex(): Promise<IndexProductPick[]> {
  if (indexData) return indexData;
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json', { cache: 'force-cache' })
      .then(r => r.json())
      .then(d => (indexData = d));
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
  product: Product | IndexProductPick;
  highlights: { key: string; value: string; indices: Array<[number, number]> }[];
}

export async function ensureIndexLoad() {
  await loadIndex();
}

export async function searchProducts(query: string, limit = 8): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const fuse = await ensureSearchReady();
  const res = fuse.search(trimmed, { limit });
  return res.map((r: any) => ({
    product: r.item as IndexProductPick,
    highlights: (r.matches || []).map((m: any) => ({
      key: m.key as string,
      value: String(m.value),
      indices: m.indices as Array<[number, number]>
    }))
  }));
}
