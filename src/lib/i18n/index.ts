import { locales as canonicalLocales } from './config';

/**
 * Internationalization utilities
 * Re-exports all i18n configuration and utilities
 */

export {
  locales,
  defaultLocale,
  localeConfig,
  isRTL,
  isValidLocale,
  getLocaleFromPath,
  getLocalizedPath,
  type Locale,
} from './config';

// Legacy exports for backward compatibility
export const SUPPORTED_LOCALES = canonicalLocales;
export const DEFAULT_LOCALE = 'id';
export const LOCALE_CONFIG = {
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr' as const },
};
