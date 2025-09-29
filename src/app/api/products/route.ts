import { NextResponse } from 'next/server';
import { products } from '@/lib/data';

export const runtime = 'edge';
export const revalidate = 300; // allow ISR if used with fetch cache later

export async function GET() {
  // In a real app this could fetch from DB; here static data -> add cache headers
  return new NextResponse(JSON.stringify({ products, count: products.length }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Public caching: 5m edge, stale-while-revalidate 1h
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600'
    }
  });
}
