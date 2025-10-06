// Simple blog module for build compatibility
export interface PostFrontMatter {
  slug: string;
  title: string;
  excerpt: string;
  cover?: string;
  publishedAt: string;
  author?: string;
  tags?: string[];
  readingMinutes?: number;
}

export interface PostData extends PostFrontMatter {
  html: string;
}

const mockPosts: PostData[] = [
  {
    slug: 'welcome-to-vuki',
    title: 'Welcome to Vuki',
    excerpt: 'This is a sample blog post',
    publishedAt: new Date().toISOString(),
    author: 'Admin',
    tags: ['welcome', 'blog'],
    readingMinutes: 2,
    html: '<h1>Welcome to Vuki</h1><p>This is a sample blog post content.</p>'
  }
];

export function getAllPosts(): PostData[] {
  return mockPosts;
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
  const wpm = 200;
  return Math.max(1, Math.round(words / wpm));
}

export function __resetBlogCache() { 
  // No-op for mock implementation
}
