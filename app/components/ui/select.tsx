import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { cn } from '../../lib/cn';
import { Icon } from './icons';

/**
 * shadcn/ui Select (Radix) on the theme tokens. Radix reads the direction from the nearest
 * `dir` attribute, so in RTL the popover aligns to the right edge and the arrow keys follow it.
 * Pass `dir` on `<Select>` when a widget must use a specific one. Logical classes only
 * (`ps-*`/`pe-*`, `end-*`), so the check mark sits at the end of the row in both directions.
 */
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'flex h-11 w-full items-center justify-between gap-3 whitespace-nowrap rounded-pill border border-line bg-surface pe-4 ps-4 text-start text-sm text-ink transition-colors hover:border-muted focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-60 data-[placeholder]:text-muted [&>span]:line-clamp-1',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Icon name="chevronDown" size={16} className="text-muted" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={6}
        className={cn(
          'relative z-50 max-h-[min(var(--radix-select-content-available-height),360px)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line bg-surface p-1 text-ink shadow-lg',
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-0.5">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg py-2.5 pe-9 ps-3 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent-soft data-[state=checked]:font-semibold data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute end-3 flex items-center">
        <SelectPrimitive.ItemIndicator>
          <Icon name="check" size={16} className="text-accent" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
