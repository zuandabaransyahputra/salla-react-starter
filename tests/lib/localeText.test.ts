import { describe, it, expect } from 'vitest';
import { localeText } from '../../app/lib/localeText';
import translations from '../stubs/theme-translations';

describe('localeText', () => {
  it('reads the key in the page language', () => {
    expect(localeText(translations, 'en', 'theme.ui.close')).toBe('Close');
    expect(localeText(translations, 'ar', 'theme.ui.close')).toBe('إغلاق');
  });

  it('falls back to Arabic, then to an empty string', () => {
    expect(localeText(translations, 'fr', 'theme.ui.close')).toBe('إغلاق');
    expect(localeText(translations, 'en', 'missing.key')).toBe('');
  });
});
