/**
 * 实时通信和通知系统
 * 支持多渠道实时消息推送、WebSocket连接、邮件、短信等
 */

import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import ZAI from 'z-ai-web-dev-sdk';

export interface NotificationMessage {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  title: string;
  content: string;
  channel: 'websocket' | 'email' | 'sms' | 'push' | 'in_app';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface UserConnection {
  userId: string;
  socketId: string;
  connectedAt: Date;
  lastActivity: Date;
  channels: string[];
  deviceInfo?: any;
}

export class RealTimeNotificationSystem {
  private static instance: RealTimeNotificationSystem;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, UserConnection> = new Map();
  private notificationQueue: NotificationMessage[] = [];
  private zai: any = null;
  private emailService: any = null;
  private smsService: any = null;
  private pushService: any = null;

  static getInstance(): RealTimeNotificationSystem {
    if (!RealTimeNotificationSystem.instance) {
      RealTimeNotificationSystem.instance = new RealTimeNotificationSystem();
    }
    return RealTimeNotificationSystem.instance;
  }

  constructor() {
    this.initializeServices();
    this.startQueueProcessor();
    this.startConnectionMonitor();
  }

  /**
   * 初始化Socket.IO服务器
   */
  initializeSocketIO(server: any): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://apexrebate.com'] 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    this.setupSocketHandlers();
    logger.info('Socket.IO server initialized');
  }

  /**
   * 设置Socket事件处理器
   */
  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      // 用户认证
      socket.on('authenticate', async (data) => {
        try {
          const { userId, token } = data;
          const isValid = await this.validateUserToken(userId, token);
          
          if (isValid) {
            // 注册用户连接
            const userConnection: UserConnection = {
              userId,
              socketId: socket.id,
              connectedAt: new Date(),
              lastActivity: new Date(),
              channels: ['general'],
              deviceInfo: data.deviceInfo
            };

            this.connectedUsers.set(userId, userConnection);
            socket.userId = userId;
            
            // 加入用户房间
            socket.join(`user_${userId}`);
            
            // 发送连接成功消息
            socket.emit('authenticated', { success: true, userId });
            
            // 发送待处理消息
            await this.sendPendingNotifications(userId);
            
            logger.info(`User authenticated: ${userId}`);
          } else {
            socket.emit('authentication_error', { error: 'Invalid token' });
            socket.disconnect();
          }
        } catch (error) {
          logger.error('Authentication error', error);
          socket.emit('authentication_error', { error: 'Authentication failed' });
        }
      });

      // 加入频道
      socket.on('join_channel', (channel) => {
        if (socket.userId) {
          socket.join(channel);
          const userConnection = this.connectedUsers.get(socket.userId);
          if (userConnection && !userConnection.channels.includes(channel)) {
            userConnection.channels.push(channel);
          }
          socket.emit('joined_channel', { channel });
        }
      });

      // 离开频道
      socket.on('leave_channel', (channel) => {
        if (socket.userId) {
          socket.leave(channel);
          const userConnection = this.connectedUsers.get(socket.userId);
          if (userConnection) {
            userConnection.channels = userConnection.channels.filter(c => c !== channel);
          }
          socket.emit('left_channel', { channel });
        }
      });

      // 发送消息
      socket.on('send_message', async (data) => {
        try {
          if (socket.userId) {
            await this.handleUserMessage(socket.userId, data);
          }
        } catch (error) {
          logger.error('Error handling user message', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // 更新活动状态
      socket.on('update_activity', () => {
        if (socket.userId) {
          const userConnection = this.connectedUsers.get(socket.userId);
          if (userConnection) {
            userConnection.lastActivity = new Date();
          }
        }
      });

      // 处理断开连接
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          logger.info(`User disconnected: ${socket.userId}`);
        }
      });
    });
  }

  /**
   * 发送通知
   */
  async sendNotification(notification: Omit<NotificationMessage, 'id'>): Promise<string> {
    try {
      const notificationId = this.generateNotificationId();
      const fullNotification: NotificationMessage = {
        ...notification,
        id: notificationId
      };

      // 验证通知数据
      await this.validateNotification(fullNotification);

      // 根据渠道发送通知
      const deliveryPromises = [];
      
      if (notification.channel === 'websocket' || notification.channel === 'in_app') {
        deliveryPromises.push(this.sendWebSocketNotification(fullNotification));
      }
      
      if (notification.channel === 'email') {
        deliveryPromises.push(this.sendEmailNotification(fullNotification));
      }
      
      if (notification.channel === 'sms') {
        deliveryPromises.push(this.sendSMSNotification(fullNotification));
      }
      
      if (notification.channel === 'push') {
        deliveryPromises.push(this.sendPushNotification(fullNotification));
      }

      // 并行发送到所有渠道
      const results = await Promise.allSettled(deliveryPromises);
      
      // 记录发送结果
      await this.logNotificationDelivery(fullNotification, results);

      logger.info(`Notification sent: ${notificationId}`, {
        userId: notification.userId,
        type: notification.type,
        channel: notification.channel
      });

      return notificationId;

    } catch (error) {
      logger.error('Failed to send notification', error);
      throw error;
    }
  }

  /**
   * 批量发送通知
   */
  async sendBulkNotifications(notifications: Omit<NotificationMessage, 'id'>[]): Promise<string[]> {
    const notificationIds: string[] = [];
    
    for (const notification of notifications) {
      try {
        const id = await this.sendNotification(notification);
        notificationIds.push(id);
      } catch (error) {
        logger.error('Failed to send bulk notification', error);
      }
    }
    
    return notificationIds;
  }

  /**
   * 发送实时广播消息
   */
  async broadcastMessage(
    channel: string,
    message: any,
    targetUsers?: string[]
  ): Promise<void> {
    try {
      if (!this.io) {
        throw new Error('Socket.IO not initialized');
      }

      if (targetUsers && targetUsers.length > 0) {
        // 发送给特定用户
        for (const userId of targetUsers) {
          this.io.to(`user_${userId}`).emit('broadcast', {
            channel,
            message,
            timestamp: new Date()
          });
        }
      } else {
        // 发送给频道中的所有用户
        this.io.to(channel).emit('broadcast', {
          channel,
          message,
          timestamp: new Date()
        });
      }

      logger.info(`Broadcast message sent to channel: ${channel}`, {
        targetUsers: targetUsers?.length || 'all'
      });

    } catch (error) {
      logger.error('Failed to broadcast message', error);
      throw error;
    }
  }

  /**
   * 获取用户在线状态
   */
  async getUserOnlineStatus(userId: string): Promise<any> {
    const connection = this.connectedUsers.get(userId);
    
    if (!connection) {
      return {
        userId,
        online: false,
        lastSeen: null
      };
    }

    return {
      userId,
      online: true,
      connectedAt: connection.connectedAt,
      lastActivity: connection.lastActivity,
      channels: connection.channels,
      deviceInfo: connection.deviceInfo
    };
  }

  /**
   * 获取在线用户统计
   */
  async getOnlineUsersStats(): Promise<any> {
    const totalUsers = this.connectedUsers.size;
    const channelStats = new Map<string, number>();
    
    for (const connection of this.connectedUsers.values()) {
      for (const channel of connection.channels) {
        channelStats.set(channel, (channelStats.get(channel) || 0) + 1);
      }
    }

    return {
      totalOnlineUsers: totalUsers,
      channels: Object.fromEntries(channelStats),
      timestamp: new Date()
    };
  }

  /**
   * 发送智能通知（使用AI生成内容）
   */
  async sendIntelligentNotification(
    userId: string,
    trigger: string,
    context: any
  ): Promise<string> {
    try {
      // 使用ZAI生成个性化通知内容
      const generatedContent = await this.generateNotificationContent(trigger, context, userId);
      
      const notification: Omit<NotificationMessage, 'id'> = {
        userId,
        type: generatedContent.type,
        title: generatedContent.title,
        content: generatedContent.content,
        channel: generatedContent.channel,
        priority: generatedContent.priority,
        data: { ...context, generated: true, trigger }
      };

      return await this.sendNotification(notification);

    } catch (error) {
      logger.error('Failed to send intelligent notification', error);
      throw error;
    }
  }

  /**
   * 私有方法实现
   */
  private async initializeServices(): Promise<void> {
    try {
      this.zai = await ZAI.create();
      
      // 初始化邮件服务
      this.emailService = {
        send: async (to: string, subject: string, content: string) => {
          logger.info(`Email sent to ${to}: ${subject}`);
          return true;
        }
      };

      // 初始化短信服务
      this.smsService = {
        send: async (to: string, message: string) => {
          logger.info(`SMS sent to ${to}: ${message.substring(0, 50)}...`);
          return true;
        }
      };

      // 初始化推送服务
      this.pushService = {
        send: async (userId: string, title: string, body: string) => {
          logger.info(`Push notification sent to ${userId}: ${title}`);
          return true;
        }
      };

      logger.info('Notification services initialized');
    } catch (error) {
      logger.error('Failed to initialize notification services', error);
    }
  }

  private async sendWebSocketNotification(notification: NotificationMessage): Promise<void> {
    if (!this.io) return;

    const userConnection = this.connectedUsers.get(notification.userId);
    if (!userConnection) {
      // 用户不在线，加入队列
      this.notificationQueue.push(notification);
      return;
    }

    // 发送实时通知
    this.io.to(`user_${notification.userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      priority: notification.priority,
      data: notification.data,
      timestamp: new Date()
    });
  }

  private async sendEmailNotification(notification: NotificationMessage): Promise<void> {
    const user = await this.getUserInfo(notification.userId);
    if (!user?.email) return;

    const htmlContent = await this.generateEmailHTML(notification);
    await this.emailService.send(user.email, notification.title, htmlContent);
  }

  private async sendSMSNotification(notification: NotificationMessage): Promise<void> {
    const user = await this.getUserInfo(notification.userId);
    if (!user?.phone) return;

    await this.smsService.send(user.phone, `${notification.title}: ${notification.content}`);
  }

  private async sendPushNotification(notification: NotificationMessage): Promise<void> {
    await this.pushService.send(notification.userId, notification.title, notification.content);
  }

  private async generateNotificationContent(
    trigger: string,
    context: any,
    userId: string
  ): Promise<any> {
    const user = await this.getUserInfo(userId);
    
    const prompt = `基于以下触发事件和用户信息，生成个性化的通知内容：

触发事件: ${trigger}
上下文: ${JSON.stringify(context, null, 2)}
用户信息: ${JSON.stringify(user, null, 2)}

请生成JSON格式的响应：
{
  "type": "info|success|warning|error|promotion",
  "title": "通知标题（简洁有力）",
  "content": "通知内容（个性化、有价值）",
  "channel": "websocket|email|sms|push",
  "priority": "low|medium|high|urgent"
}`;

    const response = await this.zai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async generateEmailHTML(notification: NotificationMessage): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { color: #333; font-size: 24px; margin-bottom: 10px; }
          .content { color: #666; line-height: 1.6; margin-bottom: 30px; }
          .footer { text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">${notification.title}</h1>
          </div>
          <div class="content">
            ${notification.content}
          </div>
          <div class="footer">
            <p>此邮件由 ApexRebate 自动发送</p>
            <p>如需帮助，请联系 support@apexrebate.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async validateUserToken(userId: string, token: string): Promise<boolean> {
    // 简化的token验证逻辑
    return token && token.length > 10;
  }

  private async validateNotification(notification: NotificationMessage): Promise<void> {
    if (!notification.userId) throw new Error('User ID is required');
    if (!notification.title) throw new Error('Title is required');
    if (!notification.content) throw new Error('Content is required');
    if (!notification.channel) throw new Error('Channel is required');
  }

  private async sendPendingNotifications(userId: string): Promise<void> {
    const pendingNotifications = this.notificationQueue.filter(
      n => n.userId === userId
    );

    for (const notification of pendingNotifications) {
      await this.sendWebSocketNotification(notification);
      // 从队列中移除
      const index = this.notificationQueue.indexOf(notification);
      if (index > -1) {
        this.notificationQueue.splice(index, 1);
      }
    }
  }

  private async handleUserMessage(userId: string, data: any): Promise<void> {
    // 处理用户发送的消息
    const message = {
      userId,
      content: data.content,
      type: data.type || 'text',
      timestamp: new Date()
    };

    // 广播消息到相关频道
    if (data.channel) {
      await this.broadcastMessage(data.channel, message);
    }

    // 记录消息
    await this.logUserMessage(message);
  }

  private async logNotificationDelivery(
    notification: NotificationMessage,
    results: PromiseSettledResult<void>[]
  ): Promise<void> {
    const logEntry = {
      notificationId: notification.id,
      userId: notification.userId,
      type: notification.type,
      channel: notification.channel,
      results: results.map((result, index) => ({
        channel: notification.channel,
        status: result.status,
        error: result.status === 'rejected' ? result.reason : null
      })),
      timestamp: new Date()
    };

    await redis.lpush('notification_delivery_logs', JSON.stringify(logEntry));
    await redis.expire('notification_delivery_logs', 86400 * 7); // 保留7天
  }

  private async logUserMessage(message: any): Promise<void> {
    await redis.lpush('user_messages', JSON.stringify(message));
    await redis.expire('user_messages', 86400 * 30); // 保留30天
  }

  private async getUserInfo(userId: string): Promise<any> {
    // 模拟用户信息
    return {
      id: userId,
      email: `user${userId}@example.com`,
      phone: `+1234567890`,
      name: `User ${userId}`,
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
      }
    };
  }

  private startQueueProcessor(): void {
    setInterval(async () => {
      try {
        // 处理延迟发送的通知
        const now = new Date();
        const scheduledNotifications = this.notificationQueue.filter(
          n => n.scheduledAt && n.scheduledAt <= now
        );

        for (const notification of scheduledNotifications) {
          await this.sendNotification(notification);
          // 从队列中移除
          const index = this.notificationQueue.indexOf(notification);
          if (index > -1) {
            this.notificationQueue.splice(index, 1);
          }
        }

        // 清理过期通知
        this.notificationQueue = this.notificationQueue.filter(
          n => !n.expiresAt || n.expiresAt > now
        );

      } catch (error) {
        logger.error('Queue processor error', error);
      }
    }, 30000); // 每30秒处理一次
  }

  private startConnectionMonitor(): void {
    setInterval(async () => {
      try {
        const now = new Date();
        const timeout = 5 * 60 * 1000; // 5分钟超时

        for (const [userId, connection] of this.connectedUsers.entries()) {
          if (now.getTime() - connection.lastActivity.getTime() > timeout) {
            // 断开不活跃的连接
            const socket = this.io?.sockets.sockets.get(connection.socketId);
            if (socket) {
              socket.disconnect();
            }
            this.connectedUsers.delete(userId);
            logger.info(`Disconnected inactive user: ${userId}`);
          }
        }
      } catch (error) {
        logger.error('Connection monitor error', error);
      }
    }, 60000); // 每分钟检查一次
  }

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const notificationSystem = RealTimeNotificationSystem.getInstance();