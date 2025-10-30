/**
 * AI智能推荐引擎 - 基于用户行为的个性化推荐系统
 */

import { logger } from './logging';
import { db } from './db';

export interface UserBehavior {
  userId: string;
  action: 'view' | 'click' | 'trade' | 'analyze' | 'save' | 'share';
  target: string; // 页面、功能或交易对
  timestamp: Date;
  duration?: number; // 停留时间（毫秒）
  metadata?: Record<string, any>;
}

export interface UserPreference {
  userId: string;
  category: string;
  score: number; // 0-1 之间的偏好分数
  lastUpdated: Date;
}

export interface Recommendation {
  id: string;
  userId: string;
  type: 'feature' | 'content' | 'trading_pair' | 'strategy' | 'tool';
  title: string;
  description: string;
  url?: string;
  confidence: number; // 0-1 之间的置信度
  reason: string;
  metadata: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

export interface RecommendationConfig {
  enabled: boolean;
  maxRecommendations: number;
  refreshInterval: number; // 小时
  minConfidence: number;
  behaviorWeight: {
    view: number;
    click: number;
    trade: number;
    analyze: number;
    save: number;
    share: number;
  };
  decayFactor: number; // 时间衰减因子
}

class AIRecommendationEngine {
  private config: RecommendationConfig;
  private userBehaviors: Map<string, UserBehavior[]> = new Map();
  private userPreferences: Map<string, UserPreference[]> = new Map();
  private recommendations: Map<string, Recommendation[]> = new Map();

  constructor(config: RecommendationConfig) {
    this.config = config;
    this.initializeEngine();
  }

  // 初始化推荐引擎
  private async initializeEngine(): Promise<void> {
    try {
      // 从数据库加载历史行为数据
      await this.loadHistoricalData();
      
      // 启动定期推荐更新
      this.startPeriodicUpdates();
      
      logger.info('AI Recommendation Engine initialized', {
        enabled: this.config.enabled,
        maxRecommendations: this.config.maxRecommendations
      });
    } catch (error) {
      logger.error('Failed to initialize AI Recommendation Engine', { 
        error: error.message 
      });
    }
  }

  // 加载历史数据
  private async loadHistoricalData(): Promise<void> {
    try {
      // 加载用户行为数据
      const behaviors = await db.userBehavior.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10000 // 最近10000条行为记录
      });

      // 按用户分组
      behaviors.forEach(behavior => {
        const userId = behavior.userId;
        if (!this.userBehaviors.has(userId)) {
          this.userBehaviors.set(userId, []);
        }
        this.userBehaviors.get(userId)!.push({
          userId: behavior.userId,
          action: behavior.action as any,
          target: behavior.target,
          timestamp: behavior.timestamp,
          duration: behavior.duration || undefined,
          metadata: behavior.metadata as any || undefined
        });
      });

      // 加载用户偏好数据
      const preferences = await db.userPreference.findMany();
      preferences.forEach(pref => {
        const userId = pref.userId;
        if (!this.userPreferences.has(userId)) {
          this.userPreferences.set(userId, []);
        }
        this.userPreferences.get(userId)!.push({
          userId: pref.userId,
          category: pref.category,
          score: pref.score,
          lastUpdated: pref.lastUpdated
        });
      });

      logger.info('Historical data loaded', {
        behaviorCount: behaviors.length,
        preferenceCount: preferences.length,
        userCount: this.userBehaviors.size
      });

    } catch (error) {
      logger.error('Failed to load historical data', { error: error.message });
    }
  }

  // 记录用户行为
  async recordBehavior(behavior: Omit<UserBehavior, 'timestamp'>): Promise<void> {
    const fullBehavior: UserBehavior = {
      ...behavior,
      timestamp: new Date()
    };

    // 存储到内存
    const userId = behavior.userId;
    if (!this.userBehaviors.has(userId)) {
      this.userBehaviors.set(userId, []);
    }
    this.userBehaviors.get(userId)!.push(fullBehavior);

    // 存储到数据库
    try {
      await db.userBehavior.create({
        data: {
          userId: fullBehavior.userId,
          action: fullBehavior.action,
          target: fullBehavior.target,
          timestamp: fullBehavior.timestamp,
          duration: fullBehavior.duration,
          metadata: fullBehavior.metadata || {}
        }
      });
    } catch (error) {
      logger.error('Failed to save user behavior', { error: error.message });
    }

    // 更新用户偏好
    await this.updateUserPreferences(userId, fullBehavior);
  }

  // 更新用户偏好
  private async updateUserPreferences(userId: string, behavior: UserBehavior): Promise<void> {
    try {
      // 分析行为，提取类别
      const category = this.extractCategory(behavior);
      if (!category) return;

      // 获取或创建用户偏好
      let preferences = this.userPreferences.get(userId) || [];
      let pref = preferences.find(p => p.category === category);

      if (!pref) {
        pref = {
          userId,
          category,
          score: 0,
          lastUpdated: new Date()
        };
        preferences.push(pref);
        this.userPreferences.set(userId, preferences);
      }

      // 根据行为更新偏好分数
      const weight = this.config.behaviorWeight[behavior.action] || 1;
      const timeDecay = this.calculateTimeDecay(behavior.timestamp);
      const scoreIncrease = weight * timeDecay;

      pref.score = Math.min(1, pref.score + scoreIncrease * 0.1);
      pref.lastUpdated = new Date();

      // 保存到数据库
      await db.userPreference.upsert({
        where: {
          userId_category: {
            userId,
            category
          }
        },
        update: {
          score: pref.score,
          lastUpdated: pref.lastUpdated
        },
        create: {
          userId,
          category,
          score: pref.score,
          lastUpdated: pref.lastUpdated
        }
      });

    } catch (error) {
      logger.error('Failed to update user preferences', { error: error.message });
    }
  }

  // 从行为中提取类别
  private extractCategory(behavior: UserBehavior): string | null {
    const { action, target, metadata } = behavior;

    // 根据目标提取类别
    if (target.includes('dashboard')) return 'dashboard';
    if (target.includes('calculator')) return 'trading_tools';
    if (target.includes('analytics')) return 'analytics';
    if (target.includes('referrals')) return 'social';
    if (target.includes('apex-pro')) return 'premium_features';
    if (target.includes('hang-soi')) return 'community';
    if (target.includes('faq')) return 'help';
    if (target.includes('profile')) return 'account';

    // 根据元数据提取类别
    if (metadata?.tradingPair) return 'trading';
    if (metadata?.exchange) return 'exchange_integration';
    if (metadata?.strategy) return 'trading_strategy';

    return null;
  }

  // 计算时间衰减
  private calculateTimeDecay(timestamp: Date): number {
    const now = new Date();
    const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    return Math.exp(-hoursDiff / (24 * this.config.decayFactor)); // 24小时为单位的衰减
  }

  // 生成推荐
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    if (!this.config.enabled) return [];

    try {
      const userBehaviors = this.userBehaviors.get(userId) || [];
      const userPreferences = this.userPreferences.get(userId) || [];

      if (userBehaviors.length === 0) {
        // 新用户，返回默认推荐
        return this.generateDefaultRecommendations(userId);
      }

      const recommendations: Recommendation[] = [];

      // 基于偏好的推荐
      const preferenceRecs = await this.generatePreferenceBasedRecommendations(userId, userPreferences);
      recommendations.push(...preferenceRecs);

      // 基于协同过滤的推荐
      const collaborativeRecs = await this.generateCollaborativeRecommendations(userId, userBehaviors);
      recommendations.push(...collaborativeRecs);

      // 基于内容的推荐
      const contentRecs = await this.generateContentBasedRecommendations(userId, userBehaviors);
      recommendations.push(...contentRecs);

      // 基于趋势的推荐
      const trendingRecs = await this.generateTrendingRecommendations(userId);
      recommendations.push(...trendingRecs);

      // 去重和排序
      const uniqueRecs = this.deduplicateRecommendations(recommendations);
      const sortedRecs = uniqueRecs
        .filter(rec => rec.confidence >= this.config.minConfidence)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.config.maxRecommendations);

      // 缓存推荐结果
      this.recommendations.set(userId, sortedRecs);

      // 保存到数据库
      await this.saveRecommendations(userId, sortedRecs);

      logger.info('Recommendations generated', {
        userId,
        count: sortedRecs.length,
        topRecommendation: sortedRecs[0]?.title
      });

      return sortedRecs;

    } catch (error) {
      logger.error('Failed to generate recommendations', { 
        userId, 
        error: error.message 
      });
      return [];
    }
  }

  // 生成默认推荐（新用户）
  private generateDefaultRecommendations(userId: string): Recommendation[] {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24小时后过期

    return [
      {
        id: `default-${userId}-1`,
        userId,
        type: 'feature',
        title: '开始使用费用计算器',
        description: '计算您的交易费用，了解可以节省多少成本',
        url: '/calculator',
        confidence: 0.8,
        reason: '新用户推荐功能',
        metadata: { priority: 'high' },
        createdAt: now,
        expiresAt
      },
      {
        id: `default-${userId}-2`,
        userId,
        type: 'content',
        title: '了解ApexRebate运作方式',
        description: '学习如何最大化您的返利收益',
        url: '/how-it-works',
        confidence: 0.7,
        reason: '教育性内容推荐',
        metadata: { priority: 'medium' },
        createdAt: now,
        expiresAt
      },
      {
        id: `default-${userId}-3`,
        userId,
        type: 'feature',
        title: '加入Hang Sói社区',
        description: '与专业交易者交流学习',
        url: '/hang-soi',
        confidence: 0.6,
        reason: '社区功能推荐',
        metadata: { priority: 'medium' },
        createdAt: now,
        expiresAt
      }
    ];
  }

  // 基于偏好的推荐
  private async generatePreferenceBasedRecommendations(
    userId: string, 
    preferences: UserPreference[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 根据用户偏好生成推荐
    for (const pref of preferences.sort((a, b) => b.score - a.score).slice(0, 3)) {
      const rec = await this.createRecommendationFromPreference(pref, now, expiresAt);
      if (rec) recommendations.push(rec);
    }

    return recommendations;
  }

  // 从偏好创建推荐
  private async createRecommendationFromPreference(
    preference: UserPreference,
    now: Date,
    expiresAt: Date
  ): Promise<Recommendation | null> {
    const { category, score } = preference;

    const recommendationMap: Record<string, Omit<Recommendation, 'id' | 'userId' | 'createdAt' | 'expiresAt'>> = {
      'dashboard': {
        type: 'feature' as const,
        title: '查看高级仪表板',
        description: '深入了解您的交易表现和费用分析',
        url: '/dashboard',
        confidence: score * 0.9,
        reason: '您经常查看仪表板数据',
        metadata: { category, source: 'preference' }
      },
      'trading_tools': {
        type: 'feature' as const,
        title: '使用高级交易工具',
        description: '优化您的交易策略，提高收益',
        url: '/calculator',
        confidence: score * 0.85,
        reason: '您对交易工具感兴趣',
        metadata: { category, source: 'preference' }
      },
      'analytics': {
        type: 'feature' as const,
        title: '深度数据分析',
        description: '发现交易模式，优化决策',
        url: '/analytics',
        confidence: score * 0.8,
        reason: '您喜欢分析交易数据',
        metadata: { category, source: 'preference' }
      },
      'premium_features': {
        type: 'feature' as const,
        title: '升级到ApexPro',
        description: '解锁专业级功能和分析工具',
        url: '/apex-pro',
        confidence: score * 0.75,
        reason: '您可能对高级功能感兴趣',
        metadata: { category, source: 'preference' }
      },
      'community': {
        type: 'feature' as const,
        title: '参与社区讨论',
        description: '与其他交易者分享经验和策略',
        url: '/hang-soi',
        confidence: score * 0.7,
        reason: '您对社区活动感兴趣',
        metadata: { category, source: 'preference' }
      }
    };

    const baseRec = recommendationMap[category];
    if (!baseRec) return null;

    return {
      id: `pref-${preference.userId}-${category}-${Date.now()}`,
      userId: preference.userId,
      ...baseRec,
      createdAt: now,
      expiresAt
    };
  }

  // 协同过滤推荐
  private async generateCollaborativeRecommendations(
    userId: string,
    behaviors: UserBehavior[]
  ): Promise<Recommendation[]> {
    // 找到相似用户
    const similarUsers = await this.findSimilarUsers(userId, behaviors);
    const recommendations: Recommendation[] = [];

    // 基于相似用户的行为生成推荐
    for (const similarUser of similarUsers.slice(0, 5)) {
      const userBehaviors = this.userBehaviors.get(similarUser.userId) || [];
      const recommendationsFromUser = await this.extractRecommendationsFromBehaviors(
        userId,
        userBehaviors,
        similarUser.similarity
      );
      recommendations.push(...recommendationsFromUser);
    }

    return recommendations;
  }

  // 找到相似用户
  private async findSimilarUsers(
    targetUserId: string,
    targetBehaviors: UserBehavior[]
  ): Promise<{ userId: string; similarity: number }[]> {
    const similarities: { userId: string; similarity: number }[] = [];

    for (const [userId, behaviors] of this.userBehaviors.entries()) {
      if (userId === targetUserId) continue;

      const similarity = this.calculateUserSimilarity(targetBehaviors, behaviors);
      if (similarity > 0.3) { // 相似度阈值
        similarities.push({ userId, similarity });
      }
    }

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  // 计算用户相似度
  private calculateUserSimilarity(behaviors1: UserBehavior[], behaviors2: UserBehavior[]): number {
    // 简化的余弦相似度计算
    const targets1 = new Set(behaviors1.map(b => b.target));
    const targets2 = new Set(behaviors2.map(b => b.target));
    
    const intersection = new Set([...targets1].filter(target => targets2.has(target)));
    const union = new Set([...targets1, ...targets2]);
    
    return intersection.size / union.size;
  }

  // 从用户行为中提取推荐
  private async extractRecommendationsFromBehaviors(
    userId: string,
    behaviors: UserBehavior[],
    similarity: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 获取用户最近的高价值行为
    const recentBehaviors = behaviors
      .filter(b => b.action === 'trade' || b.action === 'save' || b.action === 'share')
      .slice(0, 5);

    for (const behavior of recentBehaviors) {
      const rec = await this.createRecommendationFromBehavior(userId, behavior, similarity, now, expiresAt);
      if (rec) recommendations.push(rec);
    }

    return recommendations;
  }

  // 从行为创建推荐
  private async createRecommendationFromBehavior(
    userId: string,
    behavior: UserBehavior,
    similarity: number,
    now: Date,
    expiresAt: Date
  ): Promise<Recommendation | null> {
    return {
      id: `collab-${userId}-${behavior.target}-${Date.now()}`,
      userId,
      type: 'content',
      title: `探索 ${behavior.target}`,
      description: `与您相似的用户也在使用此功能`,
      url: behavior.target.startsWith('/') ? behavior.target : undefined,
      confidence: similarity * 0.7,
      reason: '基于相似用户的行为推荐',
      metadata: { 
        source: 'collaborative',
        originalBehavior: behavior,
        similarity 
      },
      createdAt: now,
      expiresAt
    };
  }

  // 基于内容的推荐
  private async generateContentBasedRecommendations(
    userId: string,
    behaviors: UserBehavior[]
  ): Promise<Recommendation[]> {
    // 分析用户感兴趣的内容类型
    const contentTypes = this.analyzeContentPreferences(behaviors);
    const recommendations: Recommendation[] = [];

    for (const contentType of contentTypes) {
      const rec = await this.createContentRecommendation(userId, contentType);
      if (rec) recommendations.push(rec);
    }

    return recommendations;
  }

  // 分析内容偏好
  private analyzeContentPreferences(behaviors: UserBehavior[]): Array<{ type: string; score: number }> {
    const preferences: Record<string, number> = {};

    for (const behavior of behaviors) {
      const contentType = this.extractContentType(behavior);
      if (contentType) {
        preferences[contentType] = (preferences[contentType] || 0) + 1;
      }
    }

    return Object.entries(preferences)
      .map(([type, count]) => ({ type, score: count / behaviors.length }))
      .sort((a, b) => b.score - a.score);
  }

  // 提取内容类型
  private extractContentType(behavior: UserBehavior): string | null {
    if (behavior.target.includes('trading')) return 'trading_content';
    if (behavior.target.includes('analysis')) return 'analysis_content';
    if (behavior.target.includes('tutorial')) return 'tutorial_content';
    if (behavior.target.includes('strategy')) return 'strategy_content';
    return null;
  }

  // 创建内容推荐
  private async createContentRecommendation(
    userId: string,
    contentType: { type: string; score: number }
  ): Promise<Recommendation | null> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const contentMap: Record<string, Omit<Recommendation, 'id' | 'userId' | 'createdAt' | 'expiresAt'>> = {
      'trading_content': {
        type: 'content' as const,
        title: '高级交易策略指南',
        description: '学习专业交易者的策略和技巧',
        url: '/blog/advanced-trading-strategies',
        confidence: contentType.score * 0.8,
        reason: '基于您对交易内容的兴趣',
        metadata: { contentType: contentType.type, source: 'content_based' }
      },
      'analysis_content': {
        type: 'content' as const,
        title: '市场分析报告',
        description: '深入了解当前市场趋势和机会',
        url: '/blog/market-analysis',
        confidence: contentType.score * 0.75,
        reason: '基于您对分析内容的兴趣',
        metadata: { contentType: contentType.type, source: 'content_based' }
      },
      'tutorial_content': {
        type: 'content' as const,
        title: '新手入门教程',
        description: '从零开始学习交易基础',
        url: '/blog/getting-started',
        confidence: contentType.score * 0.7,
        reason: '基于您对教程内容的兴趣',
        metadata: { contentType: contentType.type, source: 'content_based' }
      }
    };

    const baseRec = contentMap[contentType.type];
    if (!baseRec) return null;

    return {
      id: `content-${userId}-${contentType.type}-${Date.now()}`,
      userId,
      ...baseRec,
      createdAt: now,
      expiresAt
    };
  }

  // 趋势推荐
  private async generateTrendingRecommendations(userId: string): Promise<Recommendation[]> {
    // 获取当前热门内容
    const trendingItems = await this.getTrendingItems();
    const recommendations: Recommendation[] = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12小时后过期

    for (const item of trendingItems.slice(0, 3)) {
      recommendations.push({
        id: `trending-${userId}-${item.id}-${Date.now()}`,
        userId,
        type: 'content',
        title: item.title,
        description: item.description,
        url: item.url,
        confidence: item.popularity * 0.6,
        reason: '当前热门内容',
        metadata: { 
          source: 'trending',
          popularity: item.popularity,
          category: item.category 
        },
        createdAt: now,
        expiresAt
      });
    }

    return recommendations;
  }

  // 获取热门内容
  private async getTrendingItems(): Promise<Array<{
    id: string;
    title: string;
    description: string;
    url: string;
    popularity: number;
    category: string;
  }>> {
    // 模拟热门内容数据
    // 在实际环境中，这里会从数据库或分析服务获取
    return [
      {
        id: 'trend-1',
        title: 'DeFi交易策略详解',
        description: '深入了解去中心化金融交易策略',
        url: '/blog/defi-trading-strategies',
        popularity: 0.9,
        category: 'trading'
      },
      {
        id: 'trend-2',
        title: '费用优化技巧',
        description: '学习如何最小化交易费用',
        url: '/blog/fee-optimization',
        popularity: 0.8,
        category: 'trading_tools'
      },
      {
        id: 'trend-3',
        title: '风险管理指南',
        description: '保护您的投资组合',
        url: '/blog/risk-management',
        popularity: 0.7,
        category: 'education'
      }
    ];
  }

  // 去重推荐
  private deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>();
    const unique: Recommendation[] = [];

    for (const rec of recommendations) {
      const key = `${rec.type}-${rec.title}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    }

    return unique;
  }

  // 保存推荐到数据库
  private async saveRecommendations(userId: string, recommendations: Recommendation[]): Promise<void> {
    try {
      // 删除旧推荐
      await db.recommendation.deleteMany({
        where: { userId }
      });

      // 保存新推荐
      for (const rec of recommendations) {
        await db.recommendation.create({
          data: {
            id: rec.id,
            userId: rec.userId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            url: rec.url,
            confidence: rec.confidence,
            reason: rec.reason,
            metadata: rec.metadata,
            createdAt: rec.createdAt,
            expiresAt: rec.expiresAt
          }
        });
      }
    } catch (error) {
      logger.error('Failed to save recommendations', { error: error.message });
    }
  }

  // 获取用户推荐
  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    // 检查缓存
    const cached = this.recommendations.get(userId);
    if (cached && cached.length > 0) {
      // 检查是否过期
      const now = new Date();
      const validRecs = cached.filter(rec => rec.expiresAt > now);
      
      if (validRecs.length > 0) {
        return validRecs;
      }
    }

    // 生成新推荐
    return await this.generateRecommendations(userId);
  }

  // 启动定期更新
  private startPeriodicUpdates(): void {
    const intervalMs = this.config.refreshInterval * 60 * 60 * 1000;

    setInterval(async () => {
      try {
        // 为所有活跃用户更新推荐
        const activeUsers = Array.from(this.userBehaviors.keys());
        
        for (const userId of activeUsers) {
          await this.generateRecommendations(userId);
        }

        logger.info('Periodic recommendation update completed', {
          userCount: activeUsers.length
        });
      } catch (error) {
        logger.error('Periodic recommendation update failed', { error: error.message });
      }
    }, intervalMs);
  }

  // 更新配置
  updateConfig(updates: Partial<RecommendationConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('AI Recommendation Engine configuration updated', { config: this.config });
  }

  // 获取引擎状态
  getStatus(): {
    enabled: boolean;
    userCount: number;
    totalRecommendations: number;
    config: RecommendationConfig;
  } {
    return {
      enabled: this.config.enabled,
      userCount: this.userBehaviors.size,
      totalRecommendations: Array.from(this.recommendations.values())
        .reduce((sum, recs) => sum + recs.length, 0),
      config: this.config
    };
  }
}

// 创建默认配置
const defaultConfig: RecommendationConfig = {
  enabled: true,
  maxRecommendations: 5,
  refreshInterval: 6, // 6小时
  minConfidence: 0.3,
  behaviorWeight: {
    view: 1,
    click: 2,
    trade: 5,
    analyze: 3,
    save: 4,
    share: 4
  },
  decayFactor: 7 // 7天衰减周期
};

// 创建全局实例
export const aiRecommendationEngine = new AIRecommendationEngine(defaultConfig);

export default AIRecommendationEngine;