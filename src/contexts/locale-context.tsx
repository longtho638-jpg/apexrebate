'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface LocaleContextType {
  currentLocale: string;
  switchLocale: (newLocale: string) => Promise<void>;
  isLoading: boolean;
  preferences: {
    autoDetect: boolean;
    savedLocale: string | null;
  };
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

/**
 * Locale Provider with persistence and auto-detection
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    autoDetect: true,
    savedLocale: null as string | null,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale-preference');
      if (saved) {
        const pref = JSON.parse(saved);
        setPreferences(pref);
      }
    } catch (e) {
      console.warn('[LocaleContext] Failed to load preferences:', e);
    }
  }, []);

  /**
   * Switch locale with proper route handling and state persistence
   */
  const switchLocale = useCallback(
    async (newLocale: string) => {
      if (newLocale === locale) return; // No-op if same locale

      setIsLoading(true);
      try {
        // Save preference to localStorage
        const newPrefs = {
          autoDetect: false,
          savedLocale: newLocale,
        };
        localStorage.setItem('locale-preference', JSON.stringify(newPrefs));
        setPreferences(newPrefs);

        // Build new path with proper locale handling
        const pathWithoutLocale = pathname.replace(/^\/(en|vi)(\/|$)/, '$2') || '/';
        const newPath = newLocale === 'vi' ? pathWithoutLocale : `/en${pathWithoutLocale}`;

        // Preserve query parameters
        const queryString = searchParams.toString();
        const finalPath = queryString ? `${newPath}?${queryString}` : newPath;

        // Add a small delay to ensure translation context updates
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Push the new route - this will trigger re-fetch of translations
        router.push(finalPath);

        // Wait for navigation to complete
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error('[LocaleContext] Failed to switch locale:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [locale, pathname, searchParams, router]
  );

  return (
    <LocaleContext.Provider
      value={{
        currentLocale: locale,
        switchLocale,
        isLoading,
        preferences,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to use locale context
 */
export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocaleContext must be used within LocaleProvider');
  }
  return context;
}
