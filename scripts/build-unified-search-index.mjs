import fs from 'fs';
import path from 'path';

// Simple search index builder for CI compatibility
async function run() {
  try {
    // Create a basic search index from mock data
    const searchIndex = [
      {
        id: 'p-1',
        slug: 'urban-runner-white',
        name: 'Urban Runner White',
        description: 'Lightweight everyday sneaker with breathable mesh and cushioned sole.',
        featured: true
      },
      {
        id: 'p-2', 
        slug: 'casual-canvas-blue',
        name: 'Casual Canvas Blue',
        description: 'Classic canvas sneaker in vibrant blue with rubber sole.',
        featured: false
      }
    ];

    const outputPath = path.join(process.cwd(), 'public', 'search-index.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));
    
    console.log('[search-build] Created search index with', searchIndex.length, 'records at', outputPath);
  } catch (e) {
    console.error('[search-build] failed', e);
    process.exitCode = 1;
  }
}

run();
