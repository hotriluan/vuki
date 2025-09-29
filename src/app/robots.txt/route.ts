import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/seo';

export function GET() {
  const sitemapUrl = `${getSiteUrl().replace(/\/$/, '')}/sitemap.xml`;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } });
}