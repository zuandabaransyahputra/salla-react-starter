import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Joins class names (shadcn style): `clsx` drops falsy parts and reads conditions, and
 * `tailwind-merge` keeps the last of two conflicting Tailwind utilities, so a caller's
 * `className` can override a component's defaults. The theme's token names
 * (tailwind.config.cjs) are registered so they merge like the built-in ones.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      borderRadius: ['pill', 'large', 'big', 'tiny'],
      colors: [
        'primary',
        'bg',
        'surface',
        'surface2',
        'ink',
        'muted',
        'line',
        'accent',
        'accent-ink',
        'accent-soft',
        'danger',
        'danger-ink',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
