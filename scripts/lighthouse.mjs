#!/usr/bin/env node
// Lighthouse on the pages a reviewer opens: performance, accessibility, best practices and SEO,
// mobile and desktop. Usage:
//   pnpm lighthouse https://<store-or-preview>/ar /ar/<category-path> /ar/<product-path>
// The first argument is the full home URL; the others are paths on the same origin.
// A demo store in maintenance answers visitors with a maintenance page; set
// LH_MERCHANT=<store id> to open the merchant view first (`?utm_source=dashboard&identifier=<id>`)
// in the same Chrome Lighthouse then uses, so its cookie applies.
// CHROME_PATH points at Chrome when it is not in the default macOS location (Lighthouse itself
// finds Chrome through the same variable).
// Reports go to .lighthouse/ (git-ignored); a score table and the failing accessibility /
// best-practices / SEO audits print at the end. Runs `npx lighthouse`, so the first run downloads it.
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [home, ...paths] = process.argv.slice(2);
if (!home) {
  console.error('Usage: [LH_MERCHANT=<store-id>] pnpm lighthouse <home-url> [path ...]');
  process.exit(1);
}
const origin = new URL(home).origin;
const urls = [home, ...paths.map((p) => new URL(p, origin).href)];
const merchant = process.env.LH_MERCHANT;
const PORT = 9334;
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync('.lighthouse', { recursive: true });

let chrome;
if (merchant) {
  chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'lighthouse-'))}`,
    'about:blank',
  ]);
  // Chrome can take a few seconds to open its debugging port: poll for it.
  let list;
  for (let i = 0; i < 40 && !list; i++) {
    await sleep(500);
    list = await fetch(`http://127.0.0.1:${PORT}/json`)
      .then((r) => r.json())
      .catch(() => null);
  }
  if (!list) throw new Error(`Chrome did not open its debugging port (${CHROME}); set CHROME_PATH`);
  const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  const url = new URL(home);
  url.searchParams.set('utm_source', 'dashboard');
  url.searchParams.set('identifier', merchant);
  ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: url.href } }));
  await sleep(9000);
  ws.close();
}

const rows = [];
const failures = [];
try {
  urls.forEach((url, i) => {
    for (const preset of ['mobile', 'desktop']) {
      const out = `.lighthouse/page${i + 1}-${preset}.json`;
      const args = [
        '-y',
        'lighthouse@12.6.0',
        encodeURI(decodeURI(url)),
        '--output=json',
        `--output-path=${out}`,
        '--only-categories=performance,accessibility,best-practices,seo',
        '--quiet',
        ...(merchant ? [`--port=${PORT}`] : ['--chrome-flags=--headless=new']),
        ...(preset === 'desktop' ? ['--preset=desktop'] : []),
      ];
      const page = decodeURI(new URL(url).pathname);
      try {
        execFileSync('npx', args, { stdio: 'ignore', timeout: 240000 });
        const report = JSON.parse(readFileSync(out, 'utf8'));
        const score = (id) => Math.round((report.categories[id]?.score ?? 0) * 100);
        rows.push({
          page,
          preset,
          perf: score('performance'),
          a11y: score('accessibility'),
          best: score('best-practices'),
          seo: score('seo'),
        });
        for (const cat of ['accessibility', 'best-practices', 'seo']) {
          for (const ref of report.categories[cat].auditRefs) {
            const audit = report.audits[ref.id];
            if (ref.weight > 0 && audit.score !== null && audit.score < 1) {
              failures.push(`${page} ${preset} ${cat}:${ref.id}`);
            }
          }
        }
      } catch (error) {
        rows.push({ page, preset, error: String(error.message ?? error).slice(0, 120) });
      }
    }
  });
} finally {
  chrome?.kill();
}
console.table(rows);
if (failures.length) console.log(`Failing audits:\n  ${failures.join('\n  ')}`);
