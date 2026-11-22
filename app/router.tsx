import { createRouter } from '@salla.sa/twilight-theme-engine/tanstack';
import {
  registerHomeComponents,
  DefaultHomeComponents,
} from '@salla.sa/twilight-theme-engine/routes/home';
import { routeTree } from './routeTree.gen';
import { ExampleBanner } from './components/home';
import { registerThemeHooks } from './hooks';

// Content for the engine's hook slots (app/hooks/index.tsx).
registerThemeHooks();

// Home blocks by twilight.json path (without `home.`). Keep the spread: it holds the engine's
// default blocks (sliders, banners, product rows, testimonials…). A block with a `view_style` is
// looked up as `key:styleN` before `key`, so register both when you replace one of those.
registerHomeComponents({
  ...DefaultHomeComponents,
  'example-banner': ExampleBanner,
});

// Singleton for client-side (preserves QueryClient cache across navigations)
// SSR creates fresh instances per request via getRouter()
let clientRouter: ReturnType<typeof createRouter> | null = null;

// TanStack Start expects getRouter() for SSR compatibility
export function getRouter() {
  // On client: reuse existing router to preserve QueryClient cache
  if (typeof window !== 'undefined' && clientRouter) {
    return clientRouter;
  }

  // On SSR or first client load: create new router
  const router = createRouter(routeTree);

  // Cache for client-side
  if (typeof window !== 'undefined') {
    clientRouter = router;
  }

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
