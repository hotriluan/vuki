import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

// Simple cache in module scope (revalidated when process restarts)
let cached: any[] | null = null;

export async function GET() {
  try {
    if (!cached) {
      const file = path.join(process.cwd(), 'public', 'search-index.json');
      const raw = await fs.readFile(file, 'utf8');
      cached = JSON.parse(raw);
    }
    return NextResponse.json({ items: cached });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to load search index', detail: e.message }, { status: 500 });
  }
}
