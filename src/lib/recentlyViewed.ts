const STORAGE_KEY = 'recently-viewed:v1';
const LIMIT = 8;

export interface RecentEntry { id: string; viewedAt: number; }

export function getRecentlyViewed(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(e => e && typeof e.id === 'string' && typeof e.viewedAt === 'number');
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(id: string) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const list = getRecentlyViewed().filter(e => e.id !== id);
  list.unshift({ id, viewedAt: now });
  const trimmed = list.slice(0, LIMIT);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch {}
}
