import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * shadcn/ui Input and Textarea on the theme tokens. Text aligns to the start edge and padding is
 * symmetric, so both follow the page direction. Fields that hold Latin-only values (email, phone,
 * URL, coupon codes) can pass `dir="ltr"`; keep `text-start` so the value still lines up with the
 * label in RTL.
 */
const field =
  'w-full min-w-0 border border-line bg-surface text-start text-ink placeholder:text-muted transition-colors hover:border-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-70 aria-[invalid=true]:border-danger';

export function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(field, 'h-11 rounded-pill px-4 text-sm', className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(field, 'block min-h-[96px] rounded-xl p-3 text-sm', className)}
      {...props}
    />
  );
}
