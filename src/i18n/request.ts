import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

function englishFallback(key: string): string {
  const label = key.split('.').pop() || key;
  return label
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function mergeMessages(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const [key, overrideValue] of Object.entries(overrides)) {
    const baseValue = result[key];

    if (overrideValue && typeof overrideValue === 'object' && !Array.isArray(overrideValue)) {
      result[key] = mergeMessages(
        baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue)
          ? baseValue as Record<string, unknown>
          : {},
        overrideValue as Record<string, unknown>
      );
    } else {
      result[key] = overrideValue;
    }
  }

  return result;
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

const englishOcrOverrides: Record<string, unknown> = {
  tools: {
    ocrPdf: {
      uploadLabel: 'Upload PDF File',
      uploadDescription: 'Drag and drop a scanned PDF file here, or click to browse.',
      optionsTitle: 'OCR Options',
      languages: 'Languages',
      languagesHint: 'Select one or more languages for better accuracy',
      outputFormat: 'Output Format',
      formatText: 'Text File (.txt)',
      formatPdf: 'Searchable PDF',
      quality: 'Quality',
      qualityLow: 'Low (Faster)',
      qualityMedium: 'Medium (Recommended)',
      qualityHigh: 'High (Slower)',
      pageRange: 'Page Range',
      pageRangePlaceholder: 'e.g., 1-3, 5, 7',
      pageRangeHint: 'Leave empty for all pages',
      processButton: 'Start OCR',
      previewTitle: 'Extracted Text Preview',
      successMessage: 'OCR completed successfully! Click the download button to save your file.',
      infoTitle: 'About OCR',
      infoText: 'OCR (Optical Character Recognition) extracts text from scanned documents and images. For best results, use high-quality scans and select the correct language(s).',
    },
  },
};

const indonesianOcrOverrides: Record<string, unknown> = {
  common: {
    ocr: {
      formatMarkdown: 'Markdown Terstruktur (.md)',
      formatJson: 'JSON Terstruktur (.json)',
      enhanceContrast: 'Peningkatan Kualitas Gambar Cerdas',
      enhanceContrastDesc: 'Secara otomatis meningkatkan kontras dan mempertajam tepi untuk tinta samar dan hasil pindaian gelap',
      copyText: 'Salin Teks yang Dikenali',
      copied: 'Disalin ke clipboard!',
      openInEditor: 'Edit di Editor PDF',
      openInEditorDesc: 'Edit teks dan tata letak langsung di Editor MESpdf tanpa mengunduh',
      statsPages: 'Halaman',
      statsWords: 'Kata',
      statsChars: 'Karakter',
      statsConfidence: 'Rata-rata Tingkat Keyakinan',
      tabText: 'Pratinjau Teks',
      tabJson: 'Struktur JSON',
    },
  },
};

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  const rawIndonesianMessages = (await import('../../messages/id.json')).default;
  const rawEnglishMessages = (await import('../../messages/en.json')).default;

  // Keep the large locale catalogs untouched and complete only the OCR keys
  // that are required by the current OCR UI.
  const indonesianMessages = mergeMessages(
    rawIndonesianMessages as Record<string, unknown>,
    indonesianOcrOverrides
  );
  const englishMessages = mergeMessages(
    rawEnglishMessages as Record<string, unknown>,
    englishOcrOverrides
  );

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
