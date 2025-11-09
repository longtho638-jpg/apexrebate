/**
 * Geo-detection utility for i18n
 * Auto-detects user locale based on IP + Accept-Language header
 */

import { headers } from 'next/headers';

// Mapping of country codes to locales
const COUNTRY_TO_LOCALE: Record<string, string> = {
  // Vietnamese speakers
  'VN': 'vi',
  'KH': 'vi', // Cambodia often uses Vietnamese
  
  // English speakers (default)
  'US': 'en',
  'GB': 'en',
  'AU': 'en',
  'CA': 'en',
  'IE': 'en',
  'NZ': 'en',
  'SG': 'en',
  'HK': 'en',
  'PH': 'en',
  'IN': 'en',
  'MY': 'en',
  'TH': 'en',
  'ID': 'en',
  'JP': 'en',
  'KR': 'en',
  'CN': 'en',
  'TW': 'en',
  'ZA': 'en',
};

interface GeoLocation {
  country: string;
  locale: string;
}

/**
 * Parse Accept-Language header to determine preferred locale
 */
export function parseAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'vi'; // Default fallback
  
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', '')) || 1;
      return { code: code.split('-')[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Check for Vietnamese
  if (languages.some((l) => l.code === 'vi')) return 'vi';
  
  // Check for English
  if (languages.some((l) => l.code === 'en')) return 'en';
  
  // Default to Vietnamese for Vietnam, English for others
  return 'vi';
}

/**
 * Get user's locale from IP geolocation data (via header from proxy)
 */
export async function detectLocaleFromIP(ip: string): Promise<string> {
  try {
    // First, try to use country from CF headers if available (Cloudflare)
    const headersList = await headers();
    const cfCountry = headersList.get('cf-ipcountry');
    
    if (cfCountry) {
      const detectedLocale = COUNTRY_TO_LOCALE[cfCountry.toUpperCase()] || 'vi';
      console.log(`[i18n] Detected locale from Cloudflare: ${cfCountry} → ${detectedLocale}`);
      return detectedLocale;
    }

    // Fallback: Try to get from Accept-Language header
    const acceptLanguage = headersList.get('accept-language');
    const locale = parseAcceptLanguage(acceptLanguage);
    console.log(`[i18n] Detected locale from Accept-Language: ${locale}`);
    return locale;
  } catch (error) {
    console.warn('[i18n] Error detecting locale from IP, using default:', error);
    return 'vi';
  }
}

/**
 * Get locale from browser's accepted language
 */
export function detectLocaleFromBrowser(acceptLanguage: string | null): string {
  return parseAcceptLanguage(acceptLanguage);
}

/**
 * Smart locale detection with fallback chain
 * 1. Try IP geolocation (server-side)
 * 2. Try Accept-Language header
 * 3. Return default (vi)
 */
export async function smartLocaleDetection(ip: string): Promise<string> {
  try {
    const headersList = await headers();
    
    // Try Cloudflare IP geolocation first (most reliable)
    const cfCountry = headersList.get('cf-ipcountry');
    if (cfCountry) {
      const locale = COUNTRY_TO_LOCALE[cfCountry.toUpperCase()];
      if (locale) {
        console.log(`[i18n] Smart detection (Cloudflare): ${cfCountry} → ${locale}`);
        return locale;
      }
    }

    // Try Accept-Language header
    const acceptLanguage = headersList.get('accept-language');
    const locale = parseAcceptLanguage(acceptLanguage);
    console.log(`[i18n] Smart detection (Accept-Language): ${locale}`);
    return locale;
  } catch (error) {
    console.warn('[i18n] Smart detection failed:', error);
    return 'vi'; // Fallback to Vietnamese
  }
}
