import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

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

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function readAllFilenames(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
}

let _cache: { all: PostData[]; mtime: number } | null = null;

function loadAllInternal(): PostData[] {
  const files = readAllFilenames();
  const posts: PostData[] = [];
  for (const file of files) {
    const full = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
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
  const stat = fs.existsSync(POSTS_DIR) ? fs.statSync(POSTS_DIR) : null;
  const dirMtime = stat ? stat.mtimeMs : 0;
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
