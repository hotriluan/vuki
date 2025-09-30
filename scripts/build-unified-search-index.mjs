import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Import TS sources directly (Node >=20 can handle with ts-node/tsx in dev, but in build script we rely on ts-node register during npm prebuild or use dynamic require fallback).
// Prefer compiled JS if present; fallback to TS.
let products = [];
let getAllPosts = () => [];
try {
  // Try compiled JS (after build) first
  const mod = await import('../dist/lib/data.js');
  products = mod.products || [];
  const blogMod = await import('../dist/lib/blog.js');
  getAllPosts = blogMod.getAllPosts || (() => []);
} catch {
  // Fallback: naive parse of products array from data.ts (no TS compile needed)
  try {
    const fsRaw = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'data.ts'), 'utf8');
    const match = fsRaw.match(/export const products:\s*Product\[]\s*=\s*(\[[\s\S]*?\n\]);/);
    if (match) {
      // Use eval in isolated Function with no access to outer scope
      const arr = Function(`"use strict"; return (${match[1]})`)();
      if (Array.isArray(arr)) products = arr;
    }
  } catch (e) {
    console.warn('[build-unified-search-index] Fallback parse failed', e);
  }
  try {
    const blogFs = await import('../src/lib/blog.ts');
    getAllPosts = blogFs.getAllPosts || (() => []);
  } catch {}
}

// (moved __dirname initialization earlier)

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
