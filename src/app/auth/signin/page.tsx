import SignInClient from './SignInClient'

export default function Page({ searchParams }: { searchParams: { error?: string } }) {
  const initialError = typeof searchParams?.error === 'string' ? searchParams.error : undefined
  return <SignInClient initialError={initialError} />
}