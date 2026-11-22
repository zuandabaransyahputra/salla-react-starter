// Content for the engine's hook slots: named places in the default pages where a theme can add
// markup without forking them (`body:start`, `body:end`, `product:form.end`…). The names are
// in `HookName` from '@salla.sa/twilight-theme-engine/hooks'; see the docs recipe
// "Put content in an existing spot" (/recipes/add-content-to-a-slot).
//
// Example:
//
//   import { hookRegistry, HookName, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
//
//   hookRegistry.register(
//     HookName.BODY_END,
//     ({ twilight }: HookContext) =>
//       twilight?.theme?.settings?.my_setting === false ? null : <MyWidget />,
//     50 // priority: lower runs first
//   );

export function registerThemeHooks(): void {
  // Register hook-slot content here.
}
