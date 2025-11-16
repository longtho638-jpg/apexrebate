// Simple unit tests for the authentication middleware logic
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Utility function to check if a path is protected (extracting pathname without query)
const isProtectedRoute = (fullPath: string): boolean => {
  // Extract pathname from full path (before query parameters)
  const url = new URL(`http://example.com${fullPath.startsWith('/') ? fullPath : `/${fullPath}`}`);
  const pathname = url.pathname;

  // Extract locale from pathname if present (e.g., /vi/dashboard → vi)
  const localeMatch = pathname.match(/^\/(en|vi|th|id)(\/.*)?$/);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/') : pathname;

  // Define protected routes
  const PROTECTED_ROUTES = ['/dashboard', '/profile', '/referrals', '/admin', '/tools/upload', '/tools/analytics'];

  // Check if this is a protected route (with or without locale)
  return PROTECTED_ROUTES.some(route =>
    pathWithoutLocale === route ||
    pathWithoutLocale.startsWith(`${route}/`)
  );
};

// Utility function to check admin access
const canAccessAdmin = (userRole: string | undefined): boolean => {
  return userRole === 'ADMIN' || userRole === 'CONCIERGE';
};

describe('Authentication Middleware Logic', () => {
  describe('Route Protection', () => {
    it('should identify protected routes correctly', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true);
      expect(isProtectedRoute('/profile')).toBe(true);
      expect(isProtectedRoute('/referrals')).toBe(true);
      expect(isProtectedRoute('/admin')).toBe(true);
      expect(isProtectedRoute('/tools/upload')).toBe(true);
      expect(isProtectedRoute('/tools/analytics')).toBe(true);
    });

    it('should identify protected routes with locale prefixes', () => {
      expect(isProtectedRoute('/vi/dashboard')).toBe(true);
      expect(isProtectedRoute('/en/profile')).toBe(true);
      expect(isProtectedRoute('/th/referrals')).toBe(true);
      expect(isProtectedRoute('/id/admin')).toBe(true);
    });

    it('should identify protected sub-routes', () => {
      expect(isProtectedRoute('/dashboard/settings')).toBe(true);
      expect(isProtectedRoute('/profile/edit')).toBe(true);
      expect(isProtectedRoute('/admin/users')).toBe(true);
      expect(isProtectedRoute('/tools/upload/file')).toBe(true);
    });

    it('should identify non-protected routes', () => {
      expect(isProtectedRoute('/')).toBe(false);
      expect(isProtectedRoute('/calculator')).toBe(false);
      expect(isProtectedRoute('/faq')).toBe(false);
      expect(isProtectedRoute('/auth/signin')).toBe(false);
      expect(isProtectedRoute('/auth/signup')).toBe(false);
      expect(isProtectedRoute('/tools')).toBe(false);  // Only /tools/upload and /tools/analytics are protected
    });

    it('should identify non-protected routes with similar names', () => {
      expect(isProtectedRoute('/dashboard-custom')).toBe(false);
      expect(isProtectedRoute('/profile-test')).toBe(false);
    });
  });

  describe('Admin Access Control', () => {
    it('should allow ADMIN users to access admin areas', () => {
      expect(canAccessAdmin('ADMIN')).toBe(true);
    });

    it('should allow CONCIERGE users to access admin areas', () => {
      expect(canAccessAdmin('CONCIERGE')).toBe(true);
    });

    it('should deny USER role access to admin areas', () => {
      expect(canAccessAdmin('USER')).toBe(false);
    });

    it('should deny undefined role access to admin areas', () => {
      expect(canAccessAdmin(undefined)).toBe(false);
    });

    it('should deny invalid roles access to admin areas', () => {
      expect(canAccessAdmin('GUEST')).toBe(false);
      expect(canAccessAdmin('MODERATOR')).toBe(false);
    });
  });

  describe('Locale Extraction', () => {
    it('should extract locale from pathname', () => {
      const extractLocale = (pathname: string) => {
        const localeMatch = pathname.match(/^\/(en|vi|th|id)(\/.*)?$/);
        return localeMatch ? localeMatch[1] : null;
      };

      expect(extractLocale('/vi/dashboard')).toBe('vi');
      expect(extractLocale('/en/profile')).toBe('en');
      expect(extractLocale('/th/referrals')).toBe('th');
      expect(extractLocale('/id/admin')).toBe('id');
      
      // No locale for non-prefixed paths
      expect(extractLocale('/dashboard')).toBe(null);
      expect(extractLocale('/admin')).toBe(null);
      expect(extractLocale('/')).toBe(null);
    });

    it('should extract path without locale', () => {
      const extractPathWithoutLocale = (pathname: string) => {
        const localeMatch = pathname.match(/^\/(en|vi|th|id)(\/.*)?$/);
        return localeMatch ? (localeMatch[2] || '/') : pathname;
      };

      expect(extractPathWithoutLocale('/vi/dashboard')).toBe('/dashboard');
      expect(extractPathWithoutLocale('/en/profile')).toBe('/profile');
      expect(extractPathWithoutLocale('/th/referrals')).toBe('/referrals');
      expect(extractPathWithoutLocale('/id/admin')).toBe('/admin');
      
      // No change when no locale prefix
      expect(extractPathWithoutLocale('/dashboard')).toBe('/dashboard');
      expect(extractPathWithoutLocale('/')).toBe('/');
    });
  });

  describe('Callback URL Construction', () => {
    it('should construct callback URL with locale', () => {
      // Simulate the callback URL logic from middleware
      const constructCallbackUrl = (pathname: string) => {
        const localeMatch = pathname.match(/^\/(en|vi|th|id)(\/.*)?$/);
        const locale = localeMatch ? localeMatch[1] : null;
        return locale ? `/${locale}${pathname.replace(`/${locale}`, '')}` : pathname;
      };

      expect(constructCallbackUrl('/vi/dashboard')).toBe('/vi/dashboard');
      expect(constructCallbackUrl('/en/profile')).toBe('/en/profile');
      expect(constructCallbackUrl('/th/referrals')).toBe('/th/referrals');
      expect(constructCallbackUrl('/id/admin')).toBe('/id/admin');
      
      // When no locale, return original
      expect(constructCallbackUrl('/dashboard')).toBe('/dashboard');
    });
  });
});

// Additional tests for edge cases
describe('Authentication Middleware Edge Cases', () => {
  it('should handle case-sensitive route matching', () => {
    expect(isProtectedRoute('/DASHBOARD')).toBe(false);  // Should be case-sensitive
    expect(isProtectedRoute('/Dashboard')).toBe(false);  // Should be exact match
    expect(isProtectedRoute('/dashboard')).toBe(true);   // Only exact match works
  });

  it('should handle malformed URLs gracefully', () => {
    // These should not cause errors
    expect(isProtectedRoute('')).toBe(false);
    expect(isProtectedRoute('//')).toBe(false);
    expect(isProtectedRoute('/path/with/special-chars')).toBe(false);
  });

  it('should handle URLs with query parameters', () => {
    expect(isProtectedRoute('/dashboard?tab=analytics')).toBe(true);
    expect(isProtectedRoute('/profile?section=settings')).toBe(true);
    expect(isProtectedRoute('/admin?view=users')).toBe(true);
    expect(isProtectedRoute('/tools/upload?fileType=pdf')).toBe(true);
  });

  it('should handle admin checks with missing role', () => {
    expect(canAccessAdmin(null as any)).toBe(false);
    expect(canAccessAdmin('')).toBe(false);
  });

  it('should handle locale detection with edge cases', () => {
    const extractLocale = (pathname: string) => {
      const localeMatch = pathname.match(/^\/(en|vi|th|id)(\/.*)?$/);
      return localeMatch ? localeMatch[1] : null;
    };

    // Valid locales
    expect(extractLocale('/en')).toBe('en');
    expect(extractLocale('/vi')).toBe('vi');
    expect(extractLocale('/th')).toBe('th');
    expect(extractLocale('/id')).toBe('id');
    
    // Invalid locales (should not match)
    expect(extractLocale('/fr')).toBe(null);
    expect(extractLocale('/de')).toBe(null);
    expect(extractLocale('/invalid')).toBe(null);
  });
});