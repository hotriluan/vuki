"use client";
import { useState } from 'react';
import { getAllReviewsMerged, getAggregatedRatingMerged, addUserReview } from '@/lib/reviews';
import type { Review } from '@/lib/types';

interface Props { productId: string; initialLimit?: number }

// For mock data we fetch synchronously from in-memory list
function useProductReviews(productId: string, initialLimit: number) {
  const [all, setAll] = useState(() => getAllReviewsMerged(productId));
  const [limit, setLimit] = useState(initialLimit);
  const aggregated = getAggregatedRatingMerged(productId);
  const visible = all.slice(0, limit);
  const canShowMore = limit < all.length;
  function refresh() {
    setAll(getAllReviewsMerged(productId));
  }
  function submit(author: string, rating: number, body: string) {
    addUserReview({ author, rating, body, productId });
    refresh();
  }
  return { reviews: visible, total: all.length, showMore: () => setLimit(l => l + initialLimit), canShowMore, aggregated, submit };
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value * 2) / 2; // keep halves if needed later
  return (
    <div aria-label={`Rating ${value.toFixed(1)} out of 5`} className="flex items-center gap-0.5 text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= full;
        return <span key={i}>{filled ? '★' : '☆'}</span>;
      })}
    </div>
  );
}

export function ProductReviews({ productId, initialLimit = 2 }: Props) {
  const { reviews, total, showMore, canShowMore, aggregated, submit } = useProductReviews(productId, initialLimit);
  if (!aggregated) return null;
  return (
    <section className="mt-12 border-t pt-8" aria-labelledby="reviews-heading">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 id="reviews-heading" className="text-lg font-semibold">Đánh giá ({aggregated.count})</h2>
        <div className="flex items-center gap-3 text-sm">
          <Stars value={aggregated.average} />
          <span className="font-medium">{aggregated.average.toFixed(1)}</span>
          <span className="text-gray-500">/ 5</span>
        </div>
      </div>
      <ReviewForm onSubmit={submit} />
      <ul className="space-y-6">
        {reviews.map(r => (
          <li key={r.id} className="rounded border p-4 bg-white/40 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-sm">{r.author}</div>
              <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2 mb-2"><Stars value={r.rating} /><span className="text-xs text-gray-600">{r.rating}/5</span></div>
            {r.title && <p className="font-semibold mb-1 text-sm">{r.title}</p>}
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">{r.body}</p>
          </li>
        ))}
      </ul>
      {canShowMore && (
        <div className="mt-6">
          <button onClick={showMore} className="px-4 py-2 text-sm rounded border font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition">Xem thêm</button>
        </div>
      )}
    </section>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (author: string, rating: number, body: string) => void }) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-8">
      {!expanded && (
        <button onClick={() => setExpanded(true)} className="text-xs underline text-gray-600 hover:text-gray-900 dark:text-gray-300">Viết đánh giá</button>
      )}
      {expanded && (
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!author.trim() || !body.trim()) return;
            onSubmit(author.trim(), rating, body.trim());
            setBody('');
            setAuthor('');
            setRating(5);
            setExpanded(false);
          }}
          className="space-y-3 p-4 border rounded bg-white/60 dark:bg-zinc-800/60"
        >
          <div className="flex gap-4 flex-wrap text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Tên</span>
              <input value={author} onChange={e => setAuthor(e.target.value)} required className="border rounded px-2 py-1 bg-white dark:bg-zinc-900 dark:border-zinc-700 text-xs" placeholder="Tên của bạn" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium">Rating</span>
              <select value={rating} onChange={e => setRating(parseInt(e.target.value,10))} className="border rounded px-2 py-1 bg-white dark:bg-zinc-900 dark:border-zinc-700 text-xs">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium">Nhận xét</span>
            <textarea value={body} onChange={e => setBody(e.target.value)} required minLength={8} rows={3} className="border rounded px-2 py-1 bg-white dark:bg-zinc-900 dark:border-zinc-700 text-xs" placeholder="Chia sẻ trải nghiệm của bạn" />
          </label>
          <div className="flex gap-3">
            <button type="submit" className="px-3 py-1 text-xs rounded border font-medium hover:bg-gray-50 dark:hover:bg-zinc-700">Gửi</button>
            <button type="button" onClick={() => setExpanded(false)} className="px-3 py-1 text-xs rounded border font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-700">Huỷ</button>
          </div>
        </form>
      )}
    </div>
  );
}
