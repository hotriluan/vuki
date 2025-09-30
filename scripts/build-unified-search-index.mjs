import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products } from '../src/lib/data.js';
import { getAllPosts } from '../src/lib/blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function build() {
  const productRecords = products.map(p => ({
    id: p.id,
    type: 'product',
    name: p.name,
    description: p.description.slice(0, 400),
    slug: p.slug,
    featured: p.featured || false
  }));
  let blogRecords = [];
  try {
    blogRecords = getAllPosts().map(b => ({
      id: `blog:${b.slug}`,
      type: 'blog',
      name: b.title,
      description: b.excerpt.slice(0, 400),
      slug: b.slug
    }));
  } catch (e) {
    // blog optional during early build
  }
  const all = [...productRecords, ...blogRecords];
  const outPath = path.join(__dirname, '..', 'public', 'search-index.json');
  fs.writeFileSync(outPath, JSON.stringify(all), 'utf8');
  console.log('[build-unified-search-index] records:', all.length);
}

build();
