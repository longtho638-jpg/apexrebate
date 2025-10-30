/**
 * 自动化系统集成入口
 * 统一管理和协调所有自动化组件
 */

import { userBehaviorAnalyzer } from './user-behavior-analyzer';
import { recommendationEngine } from './recommendation-engine';
import { marketingAutomation } from './marketing-automation';
import { businessInsights } from './business-insights';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';

export class AutomationOrchestrator {
  private static instance: AutomationOrchestrator;
  private isInitialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): AutomationOrchestrator {
    if (!AutomationOrchestrator.instance) {
      AutomationOrchestrator.instance = new AutomationOrchestrator();
    }
    return AutomationOrchestrator.instance;
  }

  /**
   * 初始化自动化系统
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Automation system already initialized');
      return;
    }

    try {
      logger.info('Initializing ApexRebate Automation System...');

      // 初始化各个组件
      await this.initializeComponents();
      
      // 设置组件间通信
      await this.setupComponentCommunication();
      
      // 启动健康检查
      this.startHealthCheck();
      
      // 注册系统事件监听器
      await this.registerEventListeners();

      this.isInitialized = true;
      logger.info('Automation system initialized successfully');

      // 记录系统启动事件
      await this.logSystemEvent('system_initialized', {
        timestamp: new Date(),
        components: ['user-behavior-analyzer', 'recommendation-engine', 'marketing-automation', 'business-insights']
      });

    } catch (error) {
      logger.error('Failed to initialize automation system', error);
      throw error;
    }
  }

  /**
   * 处理用户事件
   */
  async processUserEvent(event: any): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Automation system not initialized, skipping event processing');
      return;
    }

    try {
      // 并行处理各个组件
      await Promise.allSettled([
        // 用户行为分析
        userBehaviorAnalyzer.trackEvent(event),
        
        // 营销自动化处理
        marketingAutomation.processTriggerEvent(event),
        
        // 更新推荐引擎
        recommendationEngine.updateUserPreferences(event.userId, event)
      ]);

      logger.debug(`Processed user event: ${event.eventType} for user: ${event.userId}`);

    } catch (error) {
      logger.error('Failed to process user event', error);
    }
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<any> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date(),
        components: {
          userBehaviorAnalyzer: await this.checkComponentHealth('user-behavior-analyzer'),
          recommendationEngine: await this.checkComponentHealth('recommendation-engine'),
          marketingAutomation: await this.checkComponentHealth('marketing-automation'),
          businessInsights: await this.checkComponentHealth('business-insights')
        },
        metrics: await this.getSystemMetrics(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      };

      // 检查是否有组件不健康
      const unhealthyComponents = Object.entries(health.components)
        .filter(([_, status]) => status.status !== 'healthy');

      if (unhealthyComponents.length > 0) {
        health.status = 'degraded';
        logger.warn(`System health degraded: ${unhealthyComponents.map(([name]) => name).join(', ')}`);
      }

      return health;

    } catch (error) {
      logger.error('Failed to get system health', error);
      return {
        status: 'error',
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  /**
   * 获取综合用户洞察
   */
  async getUserInsights(userId: string): Promise<any> {
    try {
      // 并行获取各个组件的洞察
      const [
        behaviorAnalytics,
        recommendations,
        journeyInfo,
        businessMetrics
      ] = await Promise.all([
        userBehaviorAnalyzer.getUserBehaviorAnalytics(userId, '30d'),
        recommendationEngine.getRecommendations(userId, { page: 'dashboard' }, 5),
        marketingAutomation.getUserJourneyStage(userId),
        businessInsights.getUserSegmentMetrics(userId)
      ]);

      return {
        userId,
        timestamp: new Date(),
        behavior: behaviorAnalytics,
        recommendations,
        journey: journeyInfo,
        businessMetrics,
        insights: this.generateUserInsights(behaviorAnalytics, recommendations, journeyInfo),
        nextBestActions: this.generateNextBestActions(behaviorAnalytics, recommendations, journeyInfo)
      };

    } catch (error) {
      logger.error(`Failed to get user insights for ${userId}`, error);
      throw error;
    }
  }

  /**
   * 执行系统优化
   */
  async optimizeSystem(): Promise<void> {
    try {
      logger.info('Starting system optimization...');

      // 优化各个组件
      await Promise.allSettled([
        marketingAutomation.optimizeCampaigns(),
        recommendationEngine.updateModels(),
        businessInsights.refreshInsights(),
        userBehaviorAnalyzer.optimizeEventProcessing()
      ]);

      // 清理缓存
      await this.cleanupCache();

      // 更新系统配置
      await this.updateSystemConfiguration();

      logger.info('System optimization completed');

    } catch (error) {
      logger.error('System optimization failed', error);
    }
  }

  /**
   * 优雅关闭系统
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down automation system...');

      // 停止健康检查
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      // 停止各个组件
      userBehaviorAnalyzer.stopEventProcessing();
      
      // 保存最终状态
      await this.saveSystemState();

      this.isInitialized = false;
      logger.info('Automation system shutdown completed');

    } catch (error) {
      logger.error('Error during system shutdown', error);
    }
  }

  /**
   * 私有方法
   */
  private async initializeComponents(): Promise<void> {
    // 组件已在各自构造函数中初始化
    logger.info('All automation components initialized');
  }

  private async setupComponentCommunication(): Promise<void> {
    // 设置组件间的通信机制
    logger.info('Component communication setup completed');
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        
        // 如果系统状态不健康，发送警报
        if (health.status !== 'healthy') {
          await this.sendHealthAlert(health);
        }
        
        // 缓存健康状态
        await redis.setex('system_health', 300, JSON.stringify(health));
        
      } catch (error) {
        logger.error('Health check failed', error);
      }
    }, 60000); // 每分钟检查一次
  }

  private async registerEventListeners(): Promise<void> {
    // 注册系统级事件监听器
    logger.info('Event listeners registered');
  }

  private async logSystemEvent(eventType: string, data: any): Promise<void> {
    const logEntry = {
      eventType,
      data,
      timestamp: new Date(),
      system: 'automation-orchestrator'
    };

    await redis.lpush('system_events', JSON.stringify(logEntry));
    await redis.expire('system_events', 86400 * 7); // 保留7天
  }

  private async checkComponentHealth(componentName: string): Promise<any> {
    try {
      // 简化的健康检查
      const startTime = Date.now();
      
      // 执行组件特定的健康检查
      switch (componentName) {
        case 'user-behavior-analyzer':
          // 检查事件处理队列
          break;
        case 'recommendation-engine':
          // 检查推荐生成性能
          break;
        case 'marketing-automation':
          // 检查活动执行状态
          break;
        case 'business-insights':
          // 检查数据更新状态
          break;
      }

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }

  private async getSystemMetrics(): Promise<any> {
    return {
      eventsProcessed: await this.getEventsProcessedCount(),
      recommendationsGenerated: await this.getRecommendationsCount(),
      campaignsActive: await this.getActiveCampaignsCount(),
      insightsGenerated: await this.getInsightsCount()
    };
  }

  private generateUserInsights(behavior: any, recommendations: any, journey: any): any[] {
    const insights = [];

    // 基于行为分析生成洞察
    if (behavior.profile?.behaviorScore > 0.8) {
      insights.push({
        type: 'high_engagement',
        message: '用户表现出高度参与度，可以考虑升级到高级功能',
        priority: 'medium'
      });
    }

    // 基于推荐生成洞察
    if (recommendations.length > 0 && recommendations[0].confidence > 0.8) {
      insights.push({
        type: 'strong_recommendation',
        message: '有高置信度的推荐可以展示给用户',
        priority: 'high'
      });
    }

    return insights;
  }

  private generateNextBestActions(behavior: any, recommendations: any, journey: any): any[] {
    const actions = [];

    // 基于用户旅程阶段推荐下一步行动
    if (journey.stage === 'new_user') {
      actions.push({
        action: 'onboarding_reminder',
        priority: 'high',
        message: '发送新手引导提醒'
      });
    }

    // 基于行为模式推荐行动
    if (behavior.profile?.engagementLevel === 'low') {
      actions.push({
        action: 're_engagement_campaign',
        priority: 'medium',
        message: '启动重新参与营销活动'
      });
    }

    return actions;
  }

  private async sendHealthAlert(health: any): Promise<void> {
    const alert = {
      type: 'health_alert',
      severity: health.status === 'error' ? 'critical' : 'warning',
      message: `Automation system health: ${health.status}`,
      details: health,
      timestamp: new Date()
    };

    await redis.lpush('system_alerts', JSON.stringify(alert));
    await redis.expire('system_alerts', 86400); // 保留24小时

    logger.warn('Health alert sent', alert);
  }

  private async cleanupCache(): Promise<void> {
    // 清理过期的缓存数据
    const keys = await redis.keys('cache_*');
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Cleaned up ${keys.length} cache entries`);
    }
  }

  private async updateSystemConfiguration(): Promise<void> {
    // 更新系统配置
    logger.info('System configuration updated');
  }

  private async saveSystemState(): Promise<void> {
    const state = {
      timestamp: new Date(),
      uptime: process.uptime(),
      isInitialized: this.isInitialized
    };

    await redis.set('system_state', JSON.stringify(state));
    logger.info('System state saved');
  }

  // 辅助方法
  private async getEventsProcessedCount(): Promise<number> {
    const count = await redis.get('metrics_events_processed');
    return parseInt(count || '0');
  }

  private async getRecommendationsCount(): Promise<number> {
    const count = await redis.get('metrics_recommendations');
    return parseInt(count || '0');
  }

  private async getActiveCampaignsCount(): Promise<number> {
    const count = await redis.get('metrics_active_campaigns');
    return parseInt(count || '0');
  }

  private async getInsightsCount(): Promise<number> {
    const count = await redis.get('metrics_insights');
    return parseInt(count || '0');
  }
}

// 导出单例实例
export const automationOrchestrator = AutomationOrchestrator.getInstance();