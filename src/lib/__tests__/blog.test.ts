import { describe, it, expect, beforeAll } from 'vitest';
import { getAllPosts, getPostBySlug, __resetBlogCache } from '@/lib/blog';

describe('blog utilities', () => {
  let posts: ReturnType<typeof getAllPosts> = [];

  beforeAll(() => {
    __resetBlogCache();
    posts = getAllPosts();
    if (posts.length === 0) {
      // Thử lại một lần phòng timing (fs load chậm CI)
      posts = getAllPosts();
    }
  });

  it('should load posts >= 4 và sort theo publishedAt desc', () => {
    expect(posts.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].publishedAt >= posts[i].publishedAt).toBe(true);
    }
  });
  it('getPostBySlug trả về đúng nội dung', () => {
    const one = posts[0];
    const by = getPostBySlug(one.slug);
    expect(by?.title).toBe(one.title);
    expect(by?.html).toContain('<h2');
  });
});
