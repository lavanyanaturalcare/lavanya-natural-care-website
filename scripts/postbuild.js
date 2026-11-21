import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, '../dist/index.html');
const notFoundPath = path.join(__dirname, '../dist/404.html');
const headersSrc = path.join(__dirname, '../public/_headers');
const headersDist = path.join(__dirname, '../dist/_headers');

try {
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('[postbuild] Created dist/404.html for static host SPA fallback');
  }
  if (fs.existsSync(headersSrc)) {
    fs.copyFileSync(headersSrc, headersDist);
    console.log('[postbuild] Verified dist/_headers for Cloudflare security headers');
  }
} catch (err) {
  console.warn('[postbuild] Postbuild error:', err);
}
