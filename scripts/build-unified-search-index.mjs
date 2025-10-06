import { buildUnifiedSearchRecords, writeUnifiedSearchIndex } from '../src/lib/searchBuild.ts';

async function run() {
  const { records, counts, version, generatedAt } = await buildUnifiedSearchRecords();
  writeUnifiedSearchIndex(records, process.cwd(), { version, generatedAt, counts });
  console.log('[search-build] version:', version, 'records:', records.length, 'products:', counts.products, 'blog:', counts.blog, 'at', generatedAt);
}

run().catch(e => {
  console.error('[search-build] failed', e);
  process.exitCode = 1;
});
