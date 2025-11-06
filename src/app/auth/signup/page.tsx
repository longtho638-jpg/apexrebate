'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Eye, EyeOff, Check, X, Mail, User, Lock, Shield } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    experience: '',
    preferredBroker: '',
    referralCode: ''
  })

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[]
  })

  const checkPasswordStrength = async (password: string) => {
    try {
      const response = await fetch('/api/auth/password-strength', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await response.json()
      setPasswordStrength(data)
    } catch (error) {
      console.error('Error checking password strength:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'password') {
      checkPasswordStrength(value)
    }
    
    setError('')
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc')
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return false
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      return false
    }

    if (passwordStrength.score < 3) {
      setError('Mật khẩu chưa đủ mạnh. Vui lòng chọn mật khẩu phức tạp hơn')
      return false
    }

    return true
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return

    // Check if email already exists
    setLoading(true)
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      if (response.status === 409) {
        setError('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.')
        setLoading(false)
        return
      }

      if (!response.ok) {
        setError('Không thể kiểm tra email. Vui lòng thử lại.')
        setLoading(false)
        return
      }

      // Success - move to step 2
      setError('')
      setStep(2)
    } catch (error) {
      console.error('Error checking email:', error)
      setError('Có lỗi xảy ra khi kiểm tra email. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
        setStep(3)
      } else {
        // Map technical errors to user-friendly messages
        if (data.error && data.error.includes('email')) {
          setError('Email đã tồn tại trong hệ thống')
        } else if (data.error && data.error.includes('password')) {
          setError('Mật khẩu không đủ mạnh')
        } else {
          setError(data.error || 'Không thể tạo tài khoản. Vui lòng thử lại.')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500'
    if (passwordStrength.score <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak'
    if (passwordStrength.score <= 3) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Join ApexRebate</CardTitle>
            <CardDescription>
              {step === 1 && "Create your account to start saving on trading fees"}
              {step === 2 && "Tell us about your trading experience"}
              {step === 3 && "Verify your email"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s < step ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-full h-1 mx-2 ${
                      s < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

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
                  
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Password strength: {getPasswordStrengthText()}</span>
                        <span className="text-gray-500">{passwordStrength.score}/5</span>
                      </div>
                      <Progress value={passwordStrength.score * 20} className="h-2" />
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {passwordStrength.feedback.map((feedback, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <X className="h-3 w-3 text-red-500" />
                              {feedback}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Next'}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Trading Experience</Label>
                  <select
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full p-3 border rounded-md"
                    required
                  >
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner (&lt;1 year)</option>
                    <option value="intermediate">Intermediate (1-3 years)</option>
                    <option value="advanced">Advanced (3-5 years)</option>
                    <option value="expert">Expert (&gt;5 years)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredBroker">Preferred Broker</Label>
                  <select
                    id="preferredBroker"
                    value={formData.preferredBroker}
                    onChange={(e) => handleInputChange('preferredBroker', e.target.value)}
                    className="w-full p-3 border rounded-md"
                  >
                    <option value="">Select your preferred broker</option>
                    <option value="binance">Binance</option>
                    <option value="bybit">Bybit</option>
                    <option value="okx">OKX</option>
                    <option value="coinbase">Coinbase</option>
                    <option value="kraken">Kraken</option>
                    <option value="kucoin">KuCoin</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter referral code if you have one"
                    value={formData.referralCode}
                    onChange={(e) => handleInputChange('referralCode', e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Check Your Email</h3>
                  <p className="text-gray-600 mt-2">
                    We've sent a verification email to <strong>{formData.email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/auth/signin'}
                    className="w-full"
                  >
                    Go to Sign In
                  </Button>
                  <p className="text-sm text-gray-500">
                    Didn't receive the email?{' '}
                    <button
                      onClick={handleSubmit}
                      className="text-blue-600 hover:underline"
                      disabled={loading}
                    >
                      Resend verification email
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}