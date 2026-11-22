#!/usr/bin/env node
/**
 * Visual QA with headless Chrome over the DevTools protocol (Node 22+ built-in WebSocket, no
 * extra dependencies). Takes screenshots and reports horizontal overflow and page errors.
 *
 *   pnpm dev                       # in another terminal, or point QA_ORIGIN at any store
 *   pnpm qa                        # matrix into .qa/
 *   pnpm qa out-dir                # another output folder
 *   pnpm qa .qa '[{"name":"home","path":"/ar","w":390,"h":844,"segs":3}]'
 *
 * Environment:
 *   QA_ORIGIN    base URL (default http://localhost:5173, the dev server). Any storefront works:
 *                QA_ORIGIN=https://<your-store-domain>
 *   QA_STORE     path prefix added after the origin, for stores served under a path (`/dev-xxxx`)
 *   QA_MERCHANT  store id: opens the merchant view first (`?utm_source=dashboard&identifier=<id>`)
 *                so a demo store in maintenance renders
 *   QA_PAGES     JSON {name: path-after-locale}; default home, cart, search, 404, brands, blog
 *   QA_LOCALES   default "ar,en"
 *   QA_DEVICES   default "desktop,phone" (1440×900 and 390×844)
 *   QA_SCHEMES   default "light,dark": emulates prefers-color-scheme, and for dark also puts
 *                QA_DARK_CLASS (default "dark", the Tailwind `darkMode: 'class'` hook) on <html>;
 *                set QA_DARK_CLASS= (empty) to rely on the media query only
 *   CHROME_PATH  Chrome binary (default: the macOS location)
 *
 * Without a shot list it runs the matrix: pages × locales × devices × schemes, full page.
 * Shot: { name, path, w, h, scheme?, full?, segs?, before?, wait?, settle? }
 *   full   – one full-page image (up to 4000px tall)
 *   segs   – N viewport images while scrolling (lazy blocks and sticky bars as users see them)
 *   before – JS run after load (open a menu, type in search…)
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [outDir = '.qa', json] = process.argv.slice(2);
const ORIGIN = `${(process.env.QA_ORIGIN ?? 'http://localhost:5173').replace(/\/$/, '')}${process.env.QA_STORE ?? ''}`;
const MERCHANT = process.env.QA_MERCHANT;
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DARK_CLASS = process.env.QA_DARK_CLASS ?? 'dark';
const PORT = 9335;
const list = (value, fallback) =>
  (value ?? fallback)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const PAGES = JSON.parse(process.env.QA_PAGES || 'null') ?? {
  home: '',
  cart: '/cart',
  search: '/search?q=a',
  notfound: '/this-page-does-not-exist',
  brands: '/brands',
  blog: '/blog',
};
const DEVICES = { desktop: [1440, 900], phone: [390, 844] };
const LOCALES = list(process.env.QA_LOCALES, 'ar,en');
const SCHEMES = list(process.env.QA_SCHEMES, 'light,dark');
const devices = list(process.env.QA_DEVICES, 'desktop,phone').map((d) => {
  if (!DEVICES[d]) throw new Error(`Unknown QA_DEVICES entry "${d}" (use desktop, phone)`);
  return [d, ...DEVICES[d]];
});

const SHOTS =
  JSON.parse(json || 'null') ??
  Object.entries(PAGES).flatMap(([name, path]) =>
    LOCALES.flatMap((lang) =>
      devices.flatMap(([device, w, h]) =>
        SCHEMES.map((scheme) => ({
          name: `${lang}-${device}-${scheme}-${name}`,
          path: `/${lang}${path}`,
          w,
          h,
          scheme,
          full: true,
        }))
      )
    )
  );

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const IGNORE = /_app\/e\/api\/s\/page|getServerSnapshot|Failed to load resource/;
// Demo-store and dev-server overlays that should not appear in screenshots.
const CLEAN = `document.querySelectorAll('salla-maintenance-alert').forEach(e=>e.remove());
document.body.classList.remove('has-maintenance-bar');
document.querySelectorAll('a[href^="/__twilight/editor"]').forEach(e=>e.remove());
[...document.querySelectorAll('button')].filter(b=>b.textContent.includes('TanStack')).forEach(b=>(b.closest('div[class^="go"]')??b).remove());`;

mkdirSync(outDir, { recursive: true });
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'qa-'))}`,
  '--hide-scrollbars',
  '--no-first-run',
  ...(process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : []),
  'about:blank',
]);
chrome.on('error', (error) => {
  console.error(`Could not start Chrome (${CHROME}): ${error.message}. Set CHROME_PATH.`);
  process.exit(1);
});

let failed = 0;
try {
  // Chrome can take several seconds to open its debugging port on a busy machine: poll for it.
  let targets;
  for (let i = 0; i < 40 && !targets; i++) {
    await sleep(500);
    targets = await fetch(`http://127.0.0.1:${PORT}/json`)
      .then((r) => r.json())
      .catch(() => null);
  }
  if (!targets) throw new Error(`Chrome did not open its debugging port (${CHROME})`);
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let seq = 0;
  const pending = new Map();
  const logs = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
    if (m.method === 'Runtime.exceptionThrown')
      logs.push(
        `EXC ${(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 600)}`
      );
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
      logs.push(
        `ERR ${m.params.args
          .map((a) => a.value ?? a.description ?? '')
          .join(' ')
          .slice(0, 200)}`
      );
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const id = ++seq;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const ev = async (expression) =>
    (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result
      ?.result?.value;
  const shoot = async (file, clip) => {
    const { result } = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 70,
      ...(clip ? { clip } : {}),
    });
    writeFileSync(join(outDir, file), Buffer.from(result.data, 'base64'));
  };

  await send('Page.enable');
  await send('Runtime.enable');
  if (MERCHANT) {
    await send('Page.navigate', {
      url: `${ORIGIN}/ar?utm_source=dashboard&identifier=${encodeURIComponent(MERCHANT)}`,
    });
    await sleep(8000);
  }

  for (const s of SHOTS) {
    const scheme = s.scheme ?? 'light';
    const metrics = (height) =>
      send('Emulation.setDeviceMetricsOverride', {
        width: s.w,
        height,
        deviceScaleFactor: 1,
        mobile: s.w < 600,
      });
    await metrics(s.h);
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: scheme }],
    });
    logs.length = 0;
    await send('Page.navigate', { url: ORIGIN + s.path });
    await sleep(s.wait ?? 7000);
    const darkClass = scheme === 'dark' && DARK_CLASS ? JSON.stringify(DARK_CLASS) : 'null';
    const info = await ev(`(async()=>{${CLEAN}
      if (${darkClass}) document.documentElement.classList.add(${darkClass});
      ${s.before ?? ''}
      await new Promise(r=>setTimeout(r,${s.settle ?? 2500}));
      const sw=document.documentElement.scrollWidth, cw=document.documentElement.clientWidth;
      return {title:document.title, dir:document.documentElement.dir, overflowX: sw>cw? sw-cw:0, height:document.documentElement.scrollHeight};})()`);

    if (s.segs) {
      for (let k = 0; k < s.segs; k++) {
        await ev(`window.scrollTo(0, ${Math.round(k * s.h * 0.85)})`);
        await sleep(1600);
        await shoot(`${s.name}-${k}.jpg`);
      }
    } else if (s.full) {
      const height = Math.min(info?.height ?? s.h, 4000);
      await metrics(height);
      await sleep(1500);
      await shoot(`${s.name}.jpg`, { x: 0, y: 0, width: s.w, height, scale: 1 });
    } else {
      await shoot(`${s.name}.jpg`);
    }
    const errors = [...new Set(logs)].filter((l) => !IGNORE.test(l));
    const bad = Boolean(info?.overflowX || errors.length || !info);
    if (bad) failed++;
    console.log(`${bad ? '✗' : '✓'} ${s.name}`, JSON.stringify({ ...info, errors }));
  }
  ws.close();
} finally {
  chrome.kill();
}
console.log(`\n${SHOTS.length - failed}/${SHOTS.length} clean; screenshots in ${outDir}/`);
process.exitCode = failed ? 1 : 0;
