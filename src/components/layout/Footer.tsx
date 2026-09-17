'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type Locale } from '@/lib/i18n/config';

export interface FooterProps {
  locale: Locale;
}

export const Footer: React.FC<FooterProps> = ({ locale }) => {
  const t = useTranslations('common');
  const currentYear = new Date().getFullYear();
  const footerLinks = [
    { href: `/${locale}/privacy`, label: t('navigation.privacy') },
  ];

  return (
    
      <footer className="container mb-4 mx-auto px-4">

        <div className="pt-8 border-t border-[hsl(var(--color-border))] flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/images/mes-logo.webp" alt="MES" className="h-8 w-auto object-contain" />
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            &copy; {currentYear} {t('brand')}. {t('footer.copyright', { year: '' }).replace(/^\d{4}\s*/, '')}
          </p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/terms`} className="text-xs text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]">Terms</Link>
            <Link href={`/${locale}/privacy`} className="text-xs text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]">Privacy</Link>
            <Link href={`/${locale}/cookies`} className="text-xs text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]">Cookies</Link>
          </div>
          
        </div>

        
      
    </footer>
  );
};

export default Footer;

