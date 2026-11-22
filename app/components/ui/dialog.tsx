import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { cn } from '../../lib/cn';
import { Icon } from './icons';

/**
 * shadcn/ui Dialog (Radix) on the theme tokens. Radix traps focus, closes on Escape and outside
 * click, and returns focus to the trigger.
 *
 * RTL: the panel is centred with `start-1/2` plus a translate whose sign flips with the
 * direction (`ltr:-translate-x-1/2 rtl:translate-x-1/2`): `start` is the right edge in RTL, so
 * a plain `-translate-x-1/2` would push the panel off screen. The close button sits at `end-3`.
 * `closeLabel` is required because the button has only an icon: pass a translated string.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  closeLabel,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { closeLabel: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed start-1/2 top-1/2 z-[61] max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-lg -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-6 text-ink shadow-2xl ltr:-translate-x-1/2 rtl:translate-x-1/2',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-pill text-ink transition-colors hover:bg-surface2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon name="close" size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn('m-0 pe-10 text-lg font-bold', className)} {...props} />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn('m-0 text-sm text-muted', className)} {...props} />
  );
}
