/**
 * 用户行为分析系统
 * 实时追踪和分析用户行为，提供智能洞察
 */

import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { 
  UserBehaviorEvent, 
  BehaviorAnalytics, 
  UserSegment, 
  BehaviorPattern 
} from '@/types/analytics';

export class UserBehaviorAnalyzer {
  private static instance: UserBehaviorAnalyzer;
  private eventQueue: UserBehaviorEvent[] = [];
  private processingInterval: NodeJS.Timeout | null = null;

  static getInstance(): UserBehaviorAnalyzer {
    if (!UserBehaviorAnalyzer.instance) {
      UserBehaviorAnalyzer.instance = new UserBehaviorAnalyzer();
    }
    return UserBehaviorAnalyzer.instance;
  }

  constructor() {
    this.startEventProcessing();
  }

  /**
   * 追踪用户行为事件
   */
  async trackEvent(event: UserBehaviorEvent): Promise<void> {
    try {
      // 添加到队列
      this.eventQueue.push(event);

      // 实时缓存关键事件
      if (this.isCriticalEvent(event)) {
        await this.cacheCriticalEvent(event);
      }

      // 更新实时统计
      await this.updateRealTimeStats(event);

      logger.info('User event tracked', {
        userId: event.userId,
        eventType: event.eventType,
        sessionId: event.sessionId
      });
    } catch (error) {
      logger.error('Failed to track user event', error);
    }
  }

  /**
   * 批量处理事件队列
   */
  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = this.eventQueue.splice(0, 100); // 批量处理100个事件
    const batchId = `batch_${Date.now()}`;

    try {
      // 保存到数据库
      await this.saveEventsBatch(events, batchId);
      
      // 更新用户画像
      await this.updateUserProfiles(events);
      
      // 检测行为模式
      await this.detectBehaviorPatterns(events);
      
      // 触发实时反应
      await this.triggerRealTimeActions(events);

      logger.info(`Processed ${events.length} events in batch ${batchId}`);
    } catch (error) {
      logger.error(`Failed to process batch ${batchId}`, error);
      // 重新加入队列处理失败的事件
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * 获取用户行为分析
   */
  async getUserBehaviorAnalytics(userId: string, timeRange: string = '7d'): Promise<BehaviorAnalytics> {
    const cacheKey = `user_analytics_${userId}_${timeRange}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.generateUserAnalytics(userId, timeRange);
    
    // 缓存15分钟
    await redis.setex(cacheKey, 900, JSON.stringify(analytics));
    
    return analytics;
  }

  /**
   * 生成用户行为分析
   */
  private async generateUserAnalytics(userId: string, timeRange: string): Promise<BehaviorAnalytics> {
    const { startDate, endDate } = this.getDateRange(timeRange);
    
    // 模拟生成分析数据（实际项目中从数据库获取）
    const analytics: BehaviorAnalytics = {
      userId,
      timeRange,
      profile: {
        sessionCount: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 500) + 100,
        interactions: Math.floor(Math.random() * 200) + 50,
        timeSpent: Math.floor(Math.random() * 3600) + 1800, // 秒
        behaviorScore: Math.random() * 0.5 + 0.5,
        preferredFeatures: ['dashboard', 'analytics', 'rebate-calculator']
      },
      events: [
        { type: 'page_view', count: 150 },
        { type: 'interaction', count: 80 },
        { type: 'session_start', count: 25 }
      ],
      topPages: [
        { url: '/dashboard', views: 45 },
        { url: '/calculator', views: 32 },
        { url: '/analytics', views: 28 }
      ],
      patterns: [],
      segment: 'active',
      generatedAt: new Date()
    };

    return analytics;
  }

  /**
   * 启动事件处理
   */
  private startEventProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processEventQueue();
    }, 5000); // 每5秒处理一次
  }

  /**
   * 停止事件处理
   */
  stopEventProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * 辅助方法
   */
  private isCriticalEvent(event: UserBehaviorEvent): boolean {
    return ['conversion', 'registration', 'premium_upgrade'].includes(event.eventType);
  }

  private async cacheCriticalEvent(event: UserBehaviorEvent): Promise<void> {
    const key = `critical_event_${event.userId}_${event.eventType}`;
    await redis.setex(key, 3600, JSON.stringify(event));
  }

  private async updateRealTimeStats(event: UserBehaviorEvent): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily_stats_${today}`;
    
    await redis.hincrby(key, `event_${event.eventType}`, 1);
    await redis.hincrby(key, 'total_events', 1);
    await redis.expire(key, 86400 * 7); // 保留7天
  }

  private async saveEventsBatch(events: UserBehaviorEvent[], batchId: string): Promise<void> {
    // 实际实现中保存到数据库
    logger.info(`Saving batch ${batchId} with ${events.length} events`);
  }

  private async updateUserProfiles(events: UserBehaviorEvent[]): Promise<void> {
    // 实际实现中更新用户画像
    logger.info(`Updating user profiles for ${events.length} events`);
  }

  private async detectBehaviorPatterns(events: UserBehaviorEvent[]): Promise<void> {
    // 实际实现中检测行为模式
    logger.info(`Detecting behavior patterns in ${events.length} events`);
  }

  private async triggerRealTimeActions(events: UserBehaviorEvent[]): Promise<void> {
    // 实际实现中触发实时反应
    logger.info(`Triggering real-time actions for ${events.length} events`);
  }

  private getDateRange(timeRange: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return { startDate, endDate };
  }
}

// 导出单例实例
export const userBehaviorAnalyzer = UserBehaviorAnalyzer.getInstance();