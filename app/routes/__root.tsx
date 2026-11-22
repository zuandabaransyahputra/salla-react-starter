import { lazy, Suspense } from 'react';
import { Scripts, Outlet } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
  ThemeHeadContent,
  ThemeStylesheet,
} from '@salla.sa/twilight-theme-engine/tanstack';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import { localeText } from '../lib/localeText';
import appCssUrl from '../styles/app.css?url';

// Dev-only: reads the theme's local twilight.json (settings + components),
// fills defaults, and lets you edit them live. Imported from the engine's `/dev`
// subpath under an import.meta.env.DEV gate so it is tree-shaken from prod builds.
const DevSettingsWidget = import.meta.env.DEV
  ? lazy(() =>
      import('@salla.sa/twilight-theme-engine/dev').then((m) => ({ default: m.DevSettingsWidget }))
    )
  : null;

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
});

function RootComponent() {
  const ctx = getTwilightContext();
  return (
    <html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* iOS turns long digit runs (VAT and CR numbers, prices) into phone links. */}
        <meta name="format-detection" content="telephone=no" />
        <ThemeStylesheet href={appCssUrl} />
        <ThemeHeadContent />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          {localeText(themeTranslations, ctx.locale, 'theme.noscript.message')}{' '}
          <a href="https://www.enable-javascript.com/" rel="noreferrer" target="_blank">
            {localeText(themeTranslations, ctx.locale, 'theme.noscript.link')}
          </a>
        </noscript>
        {/* No `layout` prop: the engine's default header and footer (MasterLayout) wrap every
            page. Pass `layout={MyLayout}` to replace them. */}
        <TwilightProvider translations={themeTranslations} toastMobilePosition="top-center">
          <Outlet />
        </TwilightProvider>
        <TanStackRouterDevtools position="bottom-right" />
        {DevSettingsWidget && (
          <Suspense fallback={null}>
            <DevSettingsWidget schema={devSchema} />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
