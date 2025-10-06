import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/search';
import { withTiming } from '@/lib/apiTiming';

// GET /api/search?q=term&limit=8
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(25, Math.max(1, parseInt(searchParams.get('limit') || '8', 10)));
  if (q.length < 2) return NextResponse.json({ items: [], total: 0 });
  return withTiming('search.GET', async () => {
    try {
      const results = await searchProducts(q, limit);
      return NextResponse.json({
        query: q,
        total: results.length,
        items: results.map(r => ({
          type: (r.product as any).type || 'product',
          slug: (r.product as any).slug,
          name: (r.product as any).name,
          description: (r.product as any).description,
          highlights: r.highlights
        }))
      });
    } catch (e: any) {
      return NextResponse.json({ error: 'Search failed', detail: e.message }, { status: 500 });
    }
  });
}
