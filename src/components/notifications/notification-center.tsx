'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  DollarSign, 
  Users, 
  Settings,
  X,
  Clock
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'payout' | 'referral' | 'system';
    title: string;
    message: string;
    data?: any;
    timestamp: string;
    read: boolean;
  };
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onClearAll }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'payout':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'referral':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'system':
        return <Settings className="w-5 h-5 text-slate-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBadgeColor = () => {
    switch (notification.type) {
      case 'payout':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'referral':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'system':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className={`p-4 border rounded-lg hover:bg-slate-50 transition-colors ${
      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBadgeColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-slate-900">
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getBadgeColor()}>
                {notification.type === 'payout' ? 'Thanh toán' :
                 notification.type === 'referral' ? 'Giới thiệu' : 'Hệ thống'}
              </Badge>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            {notification.message}
          </p>
          {notification.data && (
            <div className="text-xs text-slate-500">
              {notification.data.amount && (
                <span>Số tiền: ${notification.data.amount.toFixed(2)}</span>
              )}
              {notification.data.period && (
                <span> • Kỳ: {notification.data.period}</span>
              )}
              {notification.data.broker && (
                <span> • Sàn: {notification.data.broker}</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(notification.timestamp), { 
                addSuffix: true, 
                locale: vi 
              })}
            </span>
            <div className="flex space-x-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 px-2"
                >
                  <CheckCircle className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClearAll()}
                className="h-6 px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 bg-white shadow-lg border border-slate-200 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Thông báo</CardTitle>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    Đã đọc tất cả
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600">Chưa có thông báo nào</p>
              </div>
            ) : (
              <ScrollArea className="h-96 w-full">
                <div className="p-4 space-y-3">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onClearAll={handleClearAll}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}