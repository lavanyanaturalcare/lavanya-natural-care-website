import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wranglerBin = path.join(__dirname, '../node_modules/wrangler/bin/wrangler.js');

try {
  if (fs.existsSync(wranglerBin)) {
    let content = fs.readFileSync(wranglerBin, 'utf8');

    // 1. Remove WRANGLER_CI_MATCH_TAG right after shebang
    if (!content.includes('delete process.env.WRANGLER_CI_MATCH_TAG')) {
      const shebangMatch = content.match(/^#![^\n]+\n/);
      const shebang = shebangMatch ? shebangMatch[0] : '#!/usr/bin/env node\n';
      const body = shebangMatch ? content.slice(shebang.length) : content;
      content = `${shebang}delete process.env.WRANGLER_CI_MATCH_TAG;\ndelete process.env.CI_MATCH_TAG;\n${body}`;
    }

    // 2. Map 'preview' command to 'deploy'
    if (!content.includes("a === 'preview' ? 'deploy' : a")) {
      content = content.replace(
        '...process.argv.slice(2)',
        "...process.argv.slice(2).map(a => a === 'preview' ? 'deploy' : a)"
      );
    }

    fs.writeFileSync(wranglerBin, content, 'utf8');
    console.log('[patch-wrangler] Successfully configured wrangler bin (unset CI match tag & mapped preview -> deploy)');
  }
} catch (err) {
  console.warn('[patch-wrangler] Could not patch wrangler bin:', err);
}
