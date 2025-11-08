import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminDashboardClient from './admin-client';

/**
 * Admin Dashboard Page - Server Component
 * 🔒 Server-side authentication and authorization
 * 
 * Security:
 * - Checks authentication before rendering
 * - Validates ADMIN or CONCIERGE role
 * - Redirects unauthorized users with locale-awareness
 * 
 * Supports both /admin and /[locale]/admin routes
 */
export default async function AdminPage({
  params,
}: {
  params?: { locale?: string };
}) {
  // Determine locale from params, default to 'vi'
  const locale = params?.locale || 'vi';
  
  // 🔒 Server-side authentication check
  const session = await getServerSession(authOptions);

  // Not authenticated - redirect to signin with callback (locale-aware)
  if (!session) {
    const callbackUrl = locale ? `/${locale}/admin` : '/admin';
    redirect(`/${locale}/auth/signin?callbackUrl=${callbackUrl}`);
  }

  // ✅ Validate role and user object
  const userRole = session.user?.role || 'USER';
  
  // Not authorized (not ADMIN or CONCIERGE) - redirect to dashboard (locale-aware)
  if (userRole !== 'ADMIN' && userRole !== 'CONCIERGE') {
    const dashboardUrl = locale ? `/${locale}/dashboard` : '/dashboard';
    redirect(dashboardUrl);
  }

  // ✅ Authorized - render admin dashboard client component
  return <AdminDashboardClient />;
}
