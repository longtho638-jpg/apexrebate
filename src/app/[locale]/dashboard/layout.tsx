import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    // Redirect to locale-aware signin
    const locale = resolvedParams?.locale || 'en';
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/dashboard`);
  }

  return <>{children}</>;
}
