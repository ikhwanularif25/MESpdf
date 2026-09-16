import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

function englishFallback(key: string): string {
  const label = key.split('.').pop() || key;
  return label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function completeEnglishMessages(
  english: Record<string, unknown>,
  reference: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...english };

  for (const [key, referenceValue] of Object.entries(reference)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const currentValue = result[key];

    if (referenceValue && typeof referenceValue === 'object' && !Array.isArray(referenceValue)) {
      result[key] = completeEnglishMessages(
        currentValue && typeof currentValue === 'object' && !Array.isArray(currentValue)
          ? currentValue as Record<string, unknown>
          : {},
        referenceValue as Record<string, unknown>,
        fullKey
      );
    } else if (currentValue === undefined) {
      result[key] = englishFallback(fullKey);
    }
  }

  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  const indonesianMessages = (await import('../../messages/id.json')).default;
  const englishMessages = (await import('../../messages/en.json')).default;

  // Keep locale catalogs isolated. Using Indonesian as an English base causes
  // every missing English key to silently render Indonesian text.
  const messages = locale === 'en'
    ? completeEnglishMessages(englishMessages, indonesianMessages)
    : indonesianMessages;

  return {
    locale,
    messages,
    onError(error) {
      if (error.code !== 'MISSING_MESSAGE') {
        console.error(error);
      }
    },
    getMessageFallback({ key }) {
      return locale === 'en' ? englishFallback(key) : key;
    },
    // Configure time zone and formats
    timeZone: 'UTC',
    now: new Date(),
  };
});
