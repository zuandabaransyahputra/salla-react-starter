#!/usr/bin/env node
/**
 * Turn this starter into your own theme in one go:
 *
 *   pnpm new-theme --name-en "Mawj" --name-ar "موج" \
 *     --repo https://github.com/<you>/mawj --email you@example.com \
 *     [--id mawj] [--support-url https://…] [--description-en "…"] [--description-ar "…"]
 *
 * - twilight.json: theme name (ar/en), repository, author email, support URL, description, and a
 *   fresh `key` (UUID) for every custom home block. Keys must be unique across the Theme Store,
 *   so a copy must never keep the starter's keys.
 * - package.json: name, description, repository/homepage/bugs (from --repo).
 * - app/lib/theme.ts: the theme id (Sentry tag), from --id or the English name.
 *
 * Run it once, on a clean git tree, then: pnpm check:manifest && pnpm build && pnpm typecheck && pnpm test.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const match = /^--([a-z-]+)(?:=(.*))?$/.exec(argv[i]);
  if (!match) continue;
  if (match[2] !== undefined) args[match[1]] = match[2];
  else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[match[1]] = argv[++i];
  else args[match[1]] = '';
}

const usage = `Usage: pnpm new-theme --name-en <Name> --name-ar <الاسم> [--repo <git url>] [--email <author email>]
       [--id <kebab-id>] [--support-url <url>] [--description-en <text>] [--description-ar <text>]`;

if (!args['name-en'] || !args['name-ar'] || 'help' in args) {
  console.error(usage);
  process.exit(1);
}
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const id = slug(args.id || args['name-en']);
if (!id) {
  console.error('Could not derive an id from --name-en; pass --id <kebab-id>.');
  process.exit(1);
}
if (args.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.email)) {
  console.error(`--email does not look like an email address: ${args.email}`);
  process.exit(1);
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, data) => writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const changed = [];

// twilight.json
const twilight = readJson('twilight.json');
twilight.name = { ar: args['name-ar'], en: args['name-en'] };
if (args.repo) twilight.repository = args.repo.replace(/\.git$/, '');
if (args.email) twilight.author_email = args.email;
if (args['support-url']) twilight.support_url = args['support-url'];
else if (args.repo && /github\.com/.test(args.repo))
  twilight.support_url = `${args.repo.replace(/\.git$/, '')}/issues`;
if (args['description-en'] || args['description-ar'])
  twilight.description = {
    ar: args['description-ar'] || twilight.description?.ar || '',
    en: args['description-en'] || twilight.description?.en || '',
  };
for (const component of twilight.components ?? []) component.key = randomUUID();
writeJson('twilight.json', twilight);
changed.push('twilight.json');

// package.json
const pkg = readJson('package.json');
pkg.name = id;
pkg.version = '1.0.0';
pkg.description = args['description-en'] || `${args['name-en']} - a Salla React theme`;
if (args.repo) {
  const web = args.repo.replace(/\.git$/, '');
  pkg.repository = { type: 'git', url: `git+${web}.git` };
  pkg.homepage = `${web}#readme`;
  pkg.bugs = { url: `${web}/issues` };
} else {
  delete pkg.repository;
  delete pkg.homepage;
  delete pkg.bugs;
}
delete pkg.author;
delete pkg.keywords;
writeJson('package.json', pkg);
changed.push('package.json');

// Theme id (Sentry tag).
const themeFile = 'app/lib/theme.ts';
const themeSource = readFileSync(themeFile, 'utf8');
const nextTheme = themeSource.replace(
  /export const THEME_ID = '[^']*';/,
  `export const THEME_ID = '${id}';`
);
if (nextTheme !== themeSource) {
  writeFileSync(themeFile, nextTheme);
  changed.push(themeFile);
}

console.log(
  `✓ ${args['name-en']} (${args['name-ar']}), id "${id}": updated ${changed.join(', ')}.`
);
if (!args.email) console.log('! No --email: twilight.json still has the placeholder author_email.');
console.log('Next: edit the README and LICENSE for your theme, then');
console.log('      pnpm check:manifest && pnpm build && pnpm typecheck && pnpm test');
