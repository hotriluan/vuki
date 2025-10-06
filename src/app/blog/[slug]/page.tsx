import { getPostBySlug, generatePostParams } from '@/lib/blog';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';

export const revalidate = 600; // ISR 10 phút

interface PageProps { params: { slug: string } }

export function generateStaticParams() {
  // Temporarily return empty array to bypass build issues
  return [];
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [{ url: post.cover, alt: post.title }] : undefined,
      type: 'article',
      url,
      publishedTime: post.publishedAt,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover] : undefined,
    }
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  const iso = new Date(post.publishedAt).toISOString();
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: iso,
    dateModified: iso,
    author: post.author ? { '@type': 'Person', name: post.author } : undefined,
    image: post.cover ? [post.cover] : undefined,
    keywords: post.tags?.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${post.slug}`
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article>
        <header className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex gap-3 flex-wrap items-center">
            <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</time>
            {post.readingMinutes && <span>{post.readingMinutes} phút đọc</span>}
            {post.tags && post.tags.map(t => <span key={t} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 text-xs">#{t}</span>)}
          </div>
          {post.cover && (
            <div className="aspect-[16/9] overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}
        </header>
        <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <Script id="ld-article" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </main>
  );
}
