// Use JS build-friendly version to avoid ESM TS resolution issues in plain Node runtime
import { syncMarkdownPosts } from '../src/lib/blogSync.js';

async function run() {
  const started = Date.now();
  try {
    const res = await syncMarkdownPosts();
    const ms = Date.now() - started;
    console.log(`[blog-sync] created=${res.counts.created} updated=${res.counts.updated} skipped=${res.counts.skipped} in ${ms}ms`);
  } catch (e) {
    console.error('[blog-sync] failed', e);
    process.exitCode = 1;
  }
}

run();
