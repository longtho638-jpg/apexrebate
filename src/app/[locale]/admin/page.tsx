import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminDashboardClient from '@/components/admin/admin-client';

/**
 * Admin Dashboard Page - Locale-aware variant
 * 🔒 Server-side authentication and authorization with locale support
 * 
 * Security:
 * - Checks authentication before rendering
 * - Validates ADMIN or CONCIERGE role
 * - Redirects unauthorized users with locale-awareness
 */
export default async function AdminPage({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || 'en';

  // 🔒 Server-side authentication check
  const session = await getServerSession(authOptions);

  // Not authenticated - redirect to signin with callback (locale-aware)
  if (!session) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/admin`);
  }

  // ✅ Validate role and user object
  const userRole = session.user?.role || 'USER';

  // Not authorized (not ADMIN or CONCIERGE) - redirect to dashboard (locale-aware)
  if (userRole !== 'ADMIN' && userRole !== 'CONCIERGE') {
    redirect(`/${locale}/dashboard`);
  }

  // ✅ Authorized - render admin dashboard client component
  return <AdminDashboardClient />;
}
