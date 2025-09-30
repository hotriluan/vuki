import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog – Kiến thức & Mẹo chăm sóc giày',
  description: 'Chia sẻ kinh nghiệm chọn, bảo quản, xu hướng sneaker và tối ưu hiệu suất chạy bộ.'
};

export const revalidate = 600; // 10 phút

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map(p => (
          <article key={p.slug} className="group border rounded-lg overflow-hidden bg-white dark:bg-gray-900/60 backdrop-blur shadow-sm hover:shadow-md transition">
            {p.cover && (
              <div className="aspect-[16/9] relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.cover} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.03] transition" loading="lazy" />
              </div>
            )}
            <div className="p-5 flex flex-col gap-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 flex-wrap">
                <time dateTime={p.publishedAt}>{new Date(p.publishedAt).toLocaleDateString('vi-VN')}</time>
                {p.readingMinutes && <span>{p.readingMinutes} phút đọc</span>}
                {p.tags && p.tags.slice(0,2).map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">#{t}</span>)}
              </div>
              <h2 className="text-lg font-semibold leading-snug">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{p.excerpt}</p>
              <div>
                <Link href={`/blog/${p.slug}`} className="text-sm font-medium text-brand-accent hover:underline">Đọc tiếp →</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
