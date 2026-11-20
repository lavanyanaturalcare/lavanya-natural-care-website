import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wranglerBin = path.join(__dirname, '../node_modules/wrangler/bin/wrangler.js');

try {
  if (fs.existsSync(wranglerBin)) {
    let content = fs.readFileSync(wranglerBin, 'utf8');
    if (!content.includes("a === 'preview' ? 'deploy' : a")) {
      content = content.replace(
        '...process.argv.slice(2)',
        "...process.argv.slice(2).map(a => a === 'preview' ? 'deploy' : a)"
      );
      fs.writeFileSync(wranglerBin, content, 'utf8');
      console.log('[patch-wrangler] Successfully aliased wrangler preview -> deploy');
    }
  }
} catch (err) {
  console.warn('[patch-wrangler] Could not patch wrangler bin:', err);
}
