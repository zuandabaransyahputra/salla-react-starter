import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * RTL guard: theme components use logical Tailwind utilities (`ms-*`, `pe-*`, `start-*`,
 * `text-start`, `rounded-s-*`) so they mirror with the page direction. A physical utility is
 * allowed only behind an explicit `ltr:` / `rtl:` variant. See docs/rtl.md.
 */
const PHYSICAL =
  /^-?(?:ml|mr|pl|pr|left|right|border-[lr]|rounded-(?:[lr]|tl|tr|bl|br)|scroll-m[lr]|scroll-p[lr]|text-left|text-right|float-left|float-right|clear-left|clear-right)(?:-.+)?$/;

/** Physical utilities in a string of classes, ignoring those behind an `ltr:` or `rtl:` variant. */
export function physicalUtilities(classes: string): string[] {
  return classes.split(/\s+/).filter((token) => {
    const parts = token.split(':');
    const utility = parts.pop() ?? '';
    if (parts.includes('ltr') || parts.includes('rtl')) return false;
    return PHYSICAL.test(utility.replace(/^!/, ''));
  });
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('physicalUtilities', () => {
  it('flags physical utilities, with or without other variants', () => {
    expect(physicalUtilities('ml-4 ps-2 hover:pr-3 -mr-2 text-right pl-[10px]')).toEqual([
      'ml-4',
      'hover:pr-3',
      '-mr-2',
      'text-right',
      'pl-[10px]',
    ]);
  });

  it('allows logical utilities and physical ones behind ltr:/rtl:', () => {
    expect(
      physicalUtilities('ms-4 pe-2 start-1/2 end-3 text-start ltr:-translate-x-1/2 rtl:ml-2')
    ).toEqual([]);
  });
});

describe('theme components use logical direction utilities', () => {
  for (const file of files('app/components')) {
    it(file, () => {
      const classStrings = readFileSync(file, 'utf8').match(/(['"`])[^'"`]*\1/g) ?? [];
      const hits = classStrings.flatMap((s) => physicalUtilities(s.slice(1, -1)));
      expect(hits).toEqual([]);
    });
  }
});
