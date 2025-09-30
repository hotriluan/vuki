import matter from 'gray-matter';
import { marked } from 'marked';

// Lazy server-only modules (fs, path) so this file can be imported in the client bundle without build errors.
let _fs: typeof import('fs') | null = null;
let _path: typeof import('path') | null = null;
function ensureNodeDeps() {
  if (typeof window !== 'undefined') return false;
  if (_fs && _path) return true;
  try {
    const req = (0, eval)('require');
    _fs = req('fs');
    _path = req('path');
    return true;
  } catch {
    return false;
  }
}

export interface PostFrontMatter {
  slug: string;
  title: string;
  excerpt: string;
  cover?: string;
  publishedAt: string; // ISO
  author?: string;
  tags?: string[];
  readingMinutes?: number;
}

export interface PostData extends PostFrontMatter {
  html: string;
}

function getPostsDir() {
  if (!ensureNodeDeps()) return '';
  return _path!.join(process.cwd(), 'content', 'posts');
}

function readAllFilenames(): string[] {
  const dir = getPostsDir();
  if (!dir || !_fs?.existsSync(dir)) return [];
  return _fs.readdirSync(dir).filter(f => f.endsWith('.md'));
}

let _cache: { all: PostData[]; mtime: number } | null = null;

function loadAllInternal(): PostData[] {
  const files = readAllFilenames();
  const posts: PostData[] = [];
  for (const file of files) {
    const dir = getPostsDir();
    if (!dir) break;
    const full = _path!.join(dir, file);
    const raw = _fs!.readFileSync(full, 'utf8');
    const { content, data } = matter(raw);

    // basic validation
    if (!data.slug || !data.title || !data.publishedAt) continue;
    const fm: PostFrontMatter = {
      slug: String(data.slug),
      title: String(data.title),
      excerpt: String(data.excerpt || ''),
      cover: data.cover ? String(data.cover) : undefined,
      publishedAt: String(data.publishedAt),
      author: data.author ? String(data.author) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
      readingMinutes: data.readingMinutes ? Number(data.readingMinutes) : undefined,
    };
    const html = marked.parse(content, { async: false }) as string;
    posts.push({ ...fm, html });
  }
  posts.sort((a, b) => (a.publishedAt > b.publishedAt ? -1 : 1));
  return posts;
}

export function getAllPosts(): PostData[] {
  const dir = getPostsDir();
  let dirMtime = 0;
  if (dir && _fs?.existsSync(dir)) {
    const stat = _fs.statSync(dir);
    dirMtime = stat.mtimeMs;
  }
  if (_cache && _cache.mtime === dirMtime) return _cache.all;
  const all = loadAllInternal();
  _cache = { all, mtime: dirMtime };
  return all;
}

export function getPostBySlug(slug: string): PostData | null {
  return getAllPosts().find(p => p.slug === slug) || null;
}

export function getRecentPosts(limit = 5): PostFrontMatter[] {
  return getAllPosts().slice(0, limit).map(({ html, ...rest }) => rest);
}

export function generatePostParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  const wpm = 200; // average
  return Math.max(1, Math.round(words / wpm));
}
