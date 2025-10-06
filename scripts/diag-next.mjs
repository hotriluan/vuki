// Diagnostic script: verify tailwind config and data exports.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function main() {
  const root = process.cwd();
  const tailwindPath = path.join(root, 'tailwind.config.cjs');
  let tailwindLoaded = false;
  try {
    // Dynamically import tailwind config even though it's CJS; Node will wrap exports under default in ESM context.
    const mod = await import(pathToFileURL(tailwindPath).href);
    const cfg = mod.default || mod;
    tailwindLoaded = true;
    console.log('[diag] tailwind keys:', Object.keys(cfg || {}));
  } catch (e) {
    console.error('[diag] tailwind load error:', e);
  }

  // Import data.ts explicitly through TS source via dynamic import (since project is type: module)
  let dataMod;
  try {
  const dataUrl = pathToFileURL(path.join(root, 'src', 'lib', 'data.ts')).href;
    dataMod = await import(dataUrl);
    console.log('[diag] data export keys:', Object.keys(dataMod));
    if (dataMod.products) {
      console.log('[diag] products length:', dataMod.products.length);
    } else {
      console.warn('[diag] products missing');
    }
  } catch (e) {
    console.error('[diag] data import error:', e);
  }

  if (tailwindLoaded && dataMod && dataMod.products) {
    console.log('[diag] OK: core modules load');
    process.exit(0);
  } else {
    console.log('[diag] INCOMPLETE: investigate above errors');
    process.exit(1);
  }
}

main();
