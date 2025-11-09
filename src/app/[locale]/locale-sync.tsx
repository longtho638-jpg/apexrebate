'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

/**
 * Syncs current locale to localStorage to maintain preference persistence
 * and logs locale changes for debugging
 */
export function LocaleSync() {
  const locale = useLocale();

  useEffect(() => {
    try {
      // Update localStorage with current locale
      const preference = {
        autoDetect: false,
        savedLocale: locale,
      };
      localStorage.setItem('locale-preference', JSON.stringify(preference));
      localStorage.setItem('current-locale', locale);
      
      console.log(`[LocaleSync] Current locale: ${locale}`);
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(
        new CustomEvent('localeChanged', { detail: { locale } })
      );
    } catch (error) {
      console.warn('[LocaleSync] Failed to sync locale:', error);
    }
  }, [locale]);

  return null; // Invisible component
}
