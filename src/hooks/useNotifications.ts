import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: 'payout' | 'referral' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export const useNotifications = () => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // Initialize socket connection
      const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
        query: {
          userId: session.user.id,
          userRole: session.user.role,
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification server');
        setIsConnected(false);
      });

      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => [
          {
            ...notification,
            id: `${notification.type}-${Date.now()}`,
            read: false,
          },
          ...prev
        ]);
      });

      newSocket.on('connected', (data) => {
        console.log('Socket connected message:', data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [session]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    socket,
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
};