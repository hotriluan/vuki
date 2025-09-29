import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/seo';
import { products, categories } from '@/lib/data';

const staticPaths = ['']; // home

export function GET() {
  const base = getSiteUrl().replace(/\/$/, '');
  const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] = [];
  const now = new Date().toISOString();
  staticPaths.forEach(p => {
    const url = `${base}/${p}`.replace(/\/$/, '');
    urls.push({ loc: url, lastmod: now, priority: 1.0 });
  });
  categories.forEach(c => urls.push({ loc: `${base}/category/${c.slug}`, lastmod: now, priority: 0.7 }));
  products.forEach(p => urls.push({ loc: `${base}/product/${p.slug}`, lastmod: now, priority: 0.8 }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}\n    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}\n    ${u.priority != null ? `<priority>${u.priority.toFixed(1)}</priority>` : ''}\n  </url>`).join('\n') +
    `\n</urlset>`;
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } });
}