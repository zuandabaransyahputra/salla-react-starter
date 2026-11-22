type Buckets = Record<string, Record<string, string> | undefined>;

/**
 * Reads a key from the bundled theme translations (`virtual:twilight/theme-translations`) outside
 * the TwilightProvider, where `useTranslation` is not available (the `<noscript>` notice in
 * `__root.tsx`). Falls back to Arabic, then to an empty string.
 */
export function localeText(translations: unknown, locale: string, key: string): string {
  const buckets = translations as Buckets;
  return buckets[`${locale}.trans`]?.[key] ?? buckets['ar.trans']?.[key] ?? '';
}
