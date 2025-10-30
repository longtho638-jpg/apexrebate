import { Server } from 'socket.io';

let io: Server | null = null;

export const initializeNotifications = (server: Server) => {
  io = server;
};

export const sendPayoutNotification = (data: {
  userId: string;
  amount: number;
  period: string;
  broker: string;
}) => {
  if (!io) return;
  
  io.emit('payout-processed', data);
  console.log('Payout notification sent:', data);
};

export const sendReferralNotification = (data: {
  referrerId: string;
  referredUser: {
    name: string;
    email: string;
  };
  referralCode: string;
}) => {
  if (!io) return;
  
  io.emit('new-referral', data);
  console.log('Referral notification sent:', data);
};

export const sendSystemNotification = (data: {
  title: string;
  message: string;
  userId?: string;
}) => {
  if (!io) return;
  
  io.emit('send-notification', {
    type: 'system',
    title: data.title,
    message: data.message,
    data: { userId: data.userId },
    timestamp: new Date().toISOString(),
  });
  console.log('System notification sent:', data);
};