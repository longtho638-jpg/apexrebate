'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Shield,
  Clock
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');
  const userEmail = searchParams.get('email');

  useEffect(() => {
    if (token && userEmail) {
      setEmail(userEmail);
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Link xác nhận không hợp lệ. Vui lòng kiểm tra lại email của bạn.');
    }
  }, [token, userEmail]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `/api/auth/confirm-email?token=${token}&email=${userEmail}`
      );
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Email của bạn đã được xác nhận thành công!');
      } else {
        if (data.error?.includes('expired')) {
          setStatus('expired');
          setMessage('Link xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Có lỗi xảy ra khi xác nhận email.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.verified) {
          setStatus('success');
          setMessage('Email của bạn đã được xác nhận trước đó!');
        } else {
          setMessage('Email xác nhận mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
          if (data.verificationUrl && process.env.NODE_ENV === 'development') {
            console.log('Development Verification URL:', data.verificationUrl);
          }
        }
      } else {
        setMessage(data.error || 'Không thể gửi lại email xác nhận.');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {status === 'loading' && <RefreshCw className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <CheckCircle className="w-8 h-8 text-white" />}
              {status === 'error' && <AlertCircle className="w-8 h-8 text-white" />}
              {status === 'expired' && <Clock className="w-8 h-8 text-white" />}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Đang xác nhận email...'}
              {status === 'success' && 'Xác nhận thành công!'}
              {status === 'error' && 'Xác nhận thất bại'}
              {status === 'expired' && 'Link hết hạn'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Messages */}
            <div className={`text-center p-4 rounded-lg ${
              status === 'success' ? 'bg-green-50 text-green-800' :
              status === 'error' ? 'bg-red-50 text-red-800' :
              status === 'expired' ? 'bg-yellow-50 text-yellow-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              <div className="flex items-center justify-center mb-2">
                {status === 'loading' && <Mail className="w-5 h-5 mr-2" />}
                {status === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                {status === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
                {status === 'expired' && <Clock className="w-5 h-5 mr-2" />}
              </div>
              <p className="text-sm font-medium">{message}</p>
            </div>

            {/* Email Display */}
            {email && (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Email:</p>
                <Badge variant="outline" className="text-sm">
                  {email}
                </Badge>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Tài khoản đã được bảo mật
                  </h3>
                  <p className="text-sm text-slate-600">
                    Email của bạn đã được xác nhận và tài khoản của bạn hiện đã được bảo vệ.
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/dashboard')}
                >
                  Đi đến Dashboard
                </Button>
              </div>
            )}

            {/* Error/Expired State */}
            {(status === 'error' || status === 'expired') && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    {status === 'expired' 
                      ? 'Link xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận.'
                      : 'Không thể xác nhận email. Vui lòng thử lại hoặc yêu cầu gửi lại email.'
                    }
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Gửi lại email xác nhận
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Đang xác nhận email của bạn. Vui lòng đợi trong giây lát...
                </p>
              </div>
            )}

            {/* Back to Login */}
            <div className="text-center pt-4 border-t">
              <Link 
                href="/auth/signin" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}