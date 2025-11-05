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
 * - Redirects unauthorized users
 */
export default async function AdminPage() {
  // 🔒 Server-side authentication check
  const session = await getServerSession(authOptions);

  // Not authenticated - redirect to signin with callback
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin');
  }

  // Not authorized (not ADMIN or CONCIERGE) - redirect to dashboard
  if (session.user.role !== 'ADMIN' && session.user.role !== 'CONCIERGE') {
    redirect('/dashboard');
  }

  // ✅ Authorized - render admin dashboard client component
  return <AdminDashboardClient />;
}
