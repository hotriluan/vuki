import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAllPosts } from '@/lib/blog';

// GET /api/blog?page=1&limit=10
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  // Try DB first
  try {
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, tags: true }
      }),
      prisma.blogPost.count()
    ]);

    if (total > 0) {
      return NextResponse.json({ page, limit, total, items });
    }
  } catch (e) {
    // fall back to markdown loader below
  }

  // Fallback to markdown posts (not persisted yet)
  const all = getAllPosts();
  const total = all.length;
  const slice = all.slice(skip, skip + limit).map(p => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    tags: p.tags || []
  }));
  return NextResponse.json({ page, limit, total, items: slice, fallback: true });
}
