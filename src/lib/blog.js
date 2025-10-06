import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

function getPostsDir() {
  const cwd = process.cwd();
  const candidates = [
    process.env.BLOG_POSTS_DIR,
    path.join(cwd, 'content', 'posts'),
    path.join(cwd, '..', 'content', 'posts'),
    path.join(cwd, '..', '..', 'content', 'posts')
  ].filter(Boolean);
  for (const c of candidates) {
    try { if (c && existsSync(c)) return c; } catch {}
  }
  return path.join(cwd, 'content', 'posts');
}

let _cache = null;

function loadAllInternal() {
  const dir = getPostsDir();
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter(f => f.endsWith('.md'));
  const posts = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const raw = readFileSync(full, 'utf8');
    const { content, data } = matter(raw);
    if (!data.slug || !data.title || !data.publishedAt) continue;
    const html = marked.parse(content, { async: false });
    posts.push({
      slug: String(data.slug),
      title: String(data.title),
      excerpt: String(data.excerpt || ''),
      cover: data.cover ? String(data.cover) : undefined,
      publishedAt: String(data.publishedAt),
      author: data.author ? String(data.author) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      readingMinutes: data.readingMinutes ? Number(data.readingMinutes) : undefined,
      html
    });
  }
  posts.sort((a,b)=> (a.publishedAt > b.publishedAt ? -1 : 1));
  return posts;
}

export function getAllPosts() {
  const dir = getPostsDir();
  let mtime = 0;
  try { mtime = statSync(dir).mtimeMs; } catch {}
  if (_cache && _cache.mtime === mtime) return _cache.all;
  const all = loadAllInternal();
  if (all.length === 0) { _cache = null; return []; }
  _cache = { all, mtime };
  return all;
}
