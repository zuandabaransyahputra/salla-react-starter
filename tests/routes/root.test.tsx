/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';
import type { ComponentType, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

const provider = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));

vi.mock('@tanstack/react-router', () => ({
  Scripts: () => null,
  Outlet: () => null,
}));
vi.mock('@tanstack/react-router-devtools', () => ({ TanStackRouterDevtools: () => null }));
vi.mock('@salla.sa/twilight-theme-engine', () => ({
  TwilightProvider: ({ children, ...props }: { children?: ReactNode }) => {
    provider.props = props;
    return children;
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/tanstack', () => ({
  createTwilightRootRoute: () => (options: unknown) => options,
  getTwilightContext: () => ({ locale: 'ar', dir: 'rtl' }),
  ThemeStylesheet: () => null,
  ThemeHeadContent: () => null,
}));
vi.mock('virtual:twilight/schema', () => ({ default: {} }));
vi.mock('../../app/styles/app.css?url', () => ({ default: '/app.css' }));

describe('root shell', () => {
  it('renders the document in the request locale and direction', async () => {
    const { Route } = await import('../../app/routes/__root');
    const Shell = (Route as unknown as { shellComponent: ComponentType }).shellComponent;

    const html = renderToString(<Shell />);

    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    // The no-JavaScript notice comes from locales/ar.json.
    expect(html).toContain('JavaScript');
  });

  it("keeps the engine's default layout (no layout prop)", async () => {
    await import('../../app/routes/__root');
    expect(provider.props).not.toBeNull();
    expect(provider.props).not.toHaveProperty('layout');
  });
});
