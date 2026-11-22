import { describe, it, expect } from 'vitest';
import { cn } from '../../app/lib/cn';

describe('cn', () => {
  it('drops falsy parts', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('keeps the last of two conflicting utilities', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('merges the theme colour and radius tokens like built-in ones', () => {
    expect(cn('bg-surface', 'bg-accent')).toBe('bg-accent');
    expect(cn('text-ink', 'text-muted')).toBe('text-muted');
    expect(cn('rounded-pill', 'rounded-xl')).toBe('rounded-xl');
  });

  it('keeps logical and physical spacing apart', () => {
    expect(cn('ps-4', 'pe-2')).toBe('ps-4 pe-2');
  });
});
