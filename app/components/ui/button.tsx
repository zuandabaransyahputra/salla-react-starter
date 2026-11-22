import * as React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * shadcn/ui Button on the theme tokens: the accent follows the merchant's primary colour.
 * Padding is symmetric (`px-*`) and the gap sits between children, so icons need no
 * left/right rules in RTL; flip a directional icon with `rtl:-scale-x-100`.
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill font-semibold transition-[background-color,color,border-color,opacity] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-ink hover:opacity-90',
        outline: 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-bg',
        soft: 'border border-line bg-surface text-ink hover:bg-surface2',
        destructive:
          'border border-danger bg-transparent text-danger hover:bg-danger hover:text-danger-ink',
        ghost: 'bg-transparent text-ink hover:bg-surface2',
        link: 'h-auto px-0 text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 text-base',
        sm: 'h-10 px-4 text-sm',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. the engine `Link`) with the button styles. */
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      // A plain <button> inside a form submits by default; make that an explicit choice.
      {...(asChild ? {} : { type: type ?? 'button' })}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
