import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPostBySlug } from '@/lib/blog';

// GET /api/blog/[slug]
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  // Try DB
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (post) {
      return NextResponse.json({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        contentHtml: post.contentHtml,
        publishedAt: post.publishedAt,
        tags: post.tags || []
      });
    }
  } catch (e) {
    // ignore and fallback
  }
  const md = getPostBySlug(slug);
  if (!md) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    id: md.slug,
    slug: md.slug,
    title: md.title,
    excerpt: md.excerpt,
    contentHtml: md.html,
    publishedAt: md.publishedAt,
    tags: md.tags || [],
    fallback: true
  });
}
