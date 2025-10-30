'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Mail, AlertTriangle, RefreshCw } from 'lucide-react'

export default function VerifyRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const success = searchParams.get('success') === 'true'
  const error = searchParams.get('error')

  const handleResendEmail = async () => {
    setLoading(true)
    // Implementation would depend on storing the email somewhere
    // For now, just redirect to sign in
    setTimeout(() => {
      router.push('/auth/signin')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            {success ? (
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-6 w-4 text-red-600" />
              </div>
            )}
            
            <CardTitle className="text-2xl font-bold">
              {success ? 'Email Verified!' : 'Verification Failed'}
            </CardTitle>
            
            <CardDescription>
              {success && 'Your account has been successfully verified'}
              {!success && 'We could not verify your email address'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your account is now active. You can sign in and start using ApexRebate.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error === 'invalid' && 'The verification link is invalid or has expired.'}
                  {error === 'expired' && 'The verification link has expired. Please request a new one.'}
                  {error === 'server_error' && 'A server error occurred. Please try again later.'}
                  {!['invalid', 'expired', 'server_error'].includes(error || '') && 
                    'An error occurred during verification. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full"
                disabled={loading}
              >
                {success ? 'Sign In to Your Account' : 'Back to Sign In'}
              </Button>

              {!success && (
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending new verification email...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              Need help?{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}