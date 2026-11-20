import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, '../dist/index.html');
const notFoundPath = path.join(__dirname, '../dist/404.html');

try {
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('[postbuild] Created dist/404.html for static host SPA fallback');
  }
} catch (err) {
  console.warn('[postbuild] Could not copy 404.html:', err);
}
