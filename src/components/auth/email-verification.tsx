'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EmailVerificationProps {
  email: string;
  isVerified: boolean;
  onVerified?: () => void;
  className?: string;
}

export default function EmailVerification({ 
  email, 
  isVerified, 
  onVerified,
  className = ''
}: EmailVerificationProps) {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const handleSendVerification = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.verified) {
          toast.success('Email của bạn đã được xác nhận trước đó!');
          onVerified?.();
        } else {
          setLastSent(new Date());
          toast.success('Email xác nhận đã được gửi!');
          
          // In development, log the verification URL
          if (data.verificationUrl && process.env.NODE_ENV === 'development') {
            console.log('Development Verification URL:', data.verificationUrl);
            console.log('Development Verification Token:', data.token);
          }
        }
      } else {
        toast.error(data.error || 'Không thể gửi email xác nhận.');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSending(false);
    }
  };

  const canResend = !lastSent || (Date.now() - lastSent.getTime() > 60000); // 1 minute cooldown

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isVerified ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {isVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Mail className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-900">
                  Xác nhận Email
                </h3>
                <Badge 
                  variant={isVerified ? "default" : "secondary"}
                  className={isVerified ? "bg-green-100 text-green-800" : ""}
                >
                  {isVerified ? 'Đã xác nhận' : 'Chưa xác nhận'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{email}</p>
            </div>
          </div>
          
          {!isVerified && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendVerification}
              disabled={isSending || !canResend}
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi xác nhận
                </>
              )}
            </Button>
          )}
        </div>
        
        {!isVerified && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Tại sao cần xác nhận email?</p>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• Bảo vệ tài khoản của bạn</li>
                  <li>• Đảm bảo tính minh bạch</li>
                  <li>• Nhận thông báo quan trọng</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {lastSent && !isVerified && (
          <div className="mt-3 text-xs text-slate-500">
            Email đã được gửi vào {lastSent.toLocaleTimeString('vi-VN')}
            {!canResend && (
              <span> • Bạn có thể gửi lại sau 1 phút</span>
            )}
          </div>
        )}
        
        {isVerified && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-800">
                Email đã được xác nhận. Tài khoản của bạn đã được bảo vệ.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}