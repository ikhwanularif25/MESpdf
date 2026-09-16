'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Globe } from 'lucide-react';
import { localeConfig, locales, type Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/Button';

export interface LanguageSelectorProps {
  currentLocale: Locale;
}

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const t = useTranslations('common.buttons');
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (locale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };

  return (
    <div className="relative flex items-center gap-1" aria-label={t('selectLanguage')}>
      <Globe className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" aria-hidden="true" />
      {locales.map((locale) => (
        <Button
          key={locale}
          variant="ghost"
          size="sm"
          onClick={() => changeLocale(locale)}
          aria-current={locale === currentLocale ? 'true' : undefined}
          aria-label={localeConfig[locale].nativeName}
          className="h-8 px-2 text-xs"
        >
          {locale.toUpperCase()}
          {locale === currentLocale && <Check className="ml-1 h-3 w-3" aria-hidden="true" />}
        </Button>
      ))}
    </div>
  );
}
