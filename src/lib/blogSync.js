import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { prisma } from './prisma.js';

export async function syncMarkdownPosts(contentDir = path.join(process.cwd(), 'content', 'posts')) {
  const items = []; let created = 0, updated = 0, skipped = 0;
  if (!fs.existsSync(contentDir)) return { items, counts: { created, updated, skipped } };
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const abs = path.join(contentDir, file);
    try {
      const raw = fs.readFileSync(abs, 'utf8');
      const parsed = matter(raw);
      const fm = parsed.data || {};
      const slug = fm.slug || file.replace(/\.md$/, '').replace(/^[0-9]{4}-[0-9]{2}-/, '');
      const title = fm.title || slug;
      const excerpt = fm.excerpt || '';
      const publishedAt = fm.publishedAt || new Date().toISOString();
      const tags = Array.isArray(fm.tags) ? fm.tags : [];
      const rendered = marked.parse(parsed.content || '');
      const contentHtml = typeof rendered === 'string' ? rendered : await rendered;
      const existing = await prisma.blogPost.findUnique({ where: { slug } }).catch(() => null);
      if (!existing) {
        await prisma.blogPost.create({ data: { slug, title, excerpt, contentHtml, tags, publishedAt: new Date(publishedAt) } });
        created++; items.push({ slug, action: 'created', title, publishedAt });
      } else {
        const changed = existing.title !== title || existing.excerpt !== excerpt || existing.contentHtml !== contentHtml;
        if (changed) {
          await prisma.blogPost.update({ where: { slug }, data: { title, excerpt, contentHtml, tags, publishedAt: new Date(publishedAt) } });
          updated++; items.push({ slug, action: 'updated', title, publishedAt });
        } else {
          skipped++; items.push({ slug, action: 'skipped', title, publishedAt });
        }
      }
    } catch {
      skipped++; items.push({ slug: file, action: 'skipped', title: file, publishedAt: '' });
    }
  }
  return { items, counts: { created, updated, skipped } };
}
