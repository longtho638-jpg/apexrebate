import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardClient from './dashboard-client-vi';

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    // Redirect to locale-aware signin
    const locale = params.locale || 'vi';
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/dashboard`);
  }

  return <DashboardClient />;
}
