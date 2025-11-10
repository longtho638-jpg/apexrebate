import SignInClient from '@/components/auth/signin/SignInClient';

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  // ✅ Next.js 15: await params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const initialError = typeof resolvedSearchParams?.error === 'string' ? resolvedSearchParams.error : undefined;
  const callbackUrl = typeof resolvedSearchParams?.callbackUrl === 'string' ? resolvedSearchParams.callbackUrl : undefined;
  
  return <SignInClient initialError={initialError} initialCallbackUrl={callbackUrl} />;
}
