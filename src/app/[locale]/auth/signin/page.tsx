import SignInClient from '@/components/auth/signin/SignInClient';

export default function Page({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { error?: string; callbackUrl?: string };
}) {
  const initialError = typeof searchParams?.error === 'string' ? searchParams.error : undefined;
  const callbackUrl = typeof searchParams?.callbackUrl === 'string' ? searchParams.callbackUrl : undefined;
  
  return <SignInClient initialError={initialError} initialCallbackUrl={callbackUrl} />;
}
