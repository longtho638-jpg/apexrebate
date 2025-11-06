'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Mail, Lock, Shield, AlertTriangle, Key } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSearchParams] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  })

  // Map lỗi từ query param ?error=CredentialsSignin sang thông báo thân thiện
  useEffect(() => {
    const err = searchParams.get('error')
    if (!err) return
    if (err === 'CredentialsSignin') {
      setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.')
    } else if (/verify/i.test(err)) {
      setError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email.')
    } else {
      setError(err)
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent, isTwoFactorStep: boolean = false) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        twoFactorCode: isTwoFactorStep ? formData.twoFactorCode : undefined,
        redirect: false
      })

      if (result?.error) {
        // Map technical errors to user-friendly messages
        if (result.error.includes('Two-factor code required')) {
          setRequiresTwoFactor(true)
        } else if (result.error === 'CredentialsSignin' || result.error.includes('CredentialsSignin')) {
          setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.')
        } else if (result.error.includes('email')) {
          setError('Email không tồn tại trong hệ thống.')
        } else if (result.error.includes('password')) {
          setError('Mật khẩu không chính xác.')
        } else if (result.error.includes('verify')) {
          setError('Tài khoản chưa được xác thực. Vui lòng kiểm tra email.')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      setError('Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (response.ok) {
        setSearchParams('Password reset instructions have been sent to your email')
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your ApexRebate account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="google">Google</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                {!requiresTwoFactor ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Remember me
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-blue-600 hover:underline"
                        disabled={loading}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Key className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twoFactorCode">Authentication Code</Label>
                      <Input
                        id="twoFactorCode"
                        type="text"
                        placeholder="000000"
                        value={formData.twoFactorCode}
                        onChange={(e) => handleInputChange('twoFactorCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRequiresTwoFactor(false)}
                        className="w-full"
                      >
                        Back to Password
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="google" className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Sign in with your Google account to get started quickly
                  </p>
                  
                  <Button
                    onClick={handleGoogleSignIn}
                    className="w-full"
                    variant="outline"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {loading ? 'Signing In...' : 'Continue with Google'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}