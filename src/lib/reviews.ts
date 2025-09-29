import { Review, AggregatedRating } from './types';

// Mock reviews dataset - in a real app this would come from a database
export const reviews: Review[] = [
  {
    id: 'r-1',
    productId: 'p-1',
    author: 'Minh Tran',
    rating: 5,
    title: 'Đáng tiền',
    body: 'Giày rất nhẹ và thoải mái, mang nguyên ngày không bị đau chân.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'r-2',
    productId: 'p-1',
    author: 'Linh Phạm',
    rating: 4,
    title: 'Ổn nhưng cần thêm màu',
    body: 'Form đẹp, đệm êm. Hy vọng có thêm màu sắc khác.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'r-3',
    productId: 'p-3',
    author: 'Quang',
    rating: 5,
    body: 'Chất da rất premium, đường may chắc chắn.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'r-4',
    productId: 'p-1',
    author: 'An Nguyễn',
    rating: 3,
    body: 'Mang ổn nhưng size hơi nhỏ so với thông thường.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

export function getReviewsByProduct(productId: string): Review[] {
  return reviews.filter(r => r.productId === productId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAggregatedRating(productId: string): AggregatedRating | null {
  const productReviews = getReviewsByProduct(productId);
  if (!productReviews.length) return null;
  const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / productReviews.length;
  return { productId, average: avg, count: productReviews.length };
}

// --- User submitted reviews (localStorage only, not part of mock baseline) ---
const USER_REVIEWS_KEY = 'user-reviews:v1';

function loadUserReviews(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(r => r && typeof r.productId === 'string' && typeof r.rating === 'number' && typeof r.author === 'string' && typeof r.body === 'string');
  } catch { return []; }
}

function saveUserReviews(list: Review[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(USER_REVIEWS_KEY, JSON.stringify(list)); } catch {}
}

export function getAllReviewsMerged(productId: string): Review[] {
  const base = getReviewsByProduct(productId);
  const user = loadUserReviews().filter(r => r.productId === productId);
  // merge then sort newest first
  return [...base, ...user].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export function addUserReview(data: Omit<Review, 'id' | 'createdAt'>) {
  const list = loadUserReviews();
  const review: Review = {
    id: `ur-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    createdAt: new Date().toISOString(),
    ...data
  };
  list.unshift(review);
  saveUserReviews(list.slice(0, 50)); // cap to 50 stored
  return review;
}

export function getAggregatedRatingMerged(productId: string): AggregatedRating | null {
  const list = getAllReviewsMerged(productId);
  if (!list.length) return null;
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return { productId, average: sum / list.length, count: list.length };
}
