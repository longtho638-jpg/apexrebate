/**
 * 智能推荐引擎
 * 基于用户行为和机器学习提供个性化推荐
 */

import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { 
  Recommendation, 
  UserPreference, 
  RecommendationType, 
  RecommendationContext 
} from '@/types/recommendation';

export class IntelligentRecommendationEngine {
  private static instance: IntelligentRecommendationEngine;
  private modelCache: Map<string, any> = new Map();
  private lastModelUpdate: Date = new Date();

  static getInstance(): IntelligentRecommendationEngine {
    if (!IntelligentRecommendationEngine.instance) {
      IntelligentRecommendationEngine.instance = new IntelligentRecommendationEngine();
    }
    return IntelligentRecommendationEngine.instance;
  }

  constructor() {
    this.initializeModels();
    this.scheduleModelUpdates();
  }

  /**
   * 获取个性化推荐
   */
  async getRecommendations(
    userId: string, 
    context: RecommendationContext,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      // 获取用户偏好
      const userPreferences = await this.getUserPreferences(userId);
      
      // 获取相似用户
      const similarUsers = await this.findSimilarUsers(userId, userPreferences);
      
      // 生成推荐候选
      const candidates = await this.generateRecommendationCandidates(
        userId, 
        userPreferences, 
        similarUsers, 
        context
      );
      
      // 评分和排序
      const scoredRecommendations = await this.scoreRecommendations(
        candidates, 
        userPreferences, 
        context
      );
      
      // 应用多样性和新颖性
      const finalRecommendations = await this.applyDiversityAndNovelty(
        scoredRecommendations, 
        userPreferences, 
        limit
      );
      
      // 记录推荐日志
      await this.logRecommendations(userId, finalRecommendations, context);

      logger.info(`Generated ${finalRecommendations.length} recommendations for user ${userId}`);
      return finalRecommendations;

    } catch (error) {
      logger.error('Failed to generate recommendations', error);
      return this.getFallbackRecommendations(userId, context, limit);
    }
  }

  /**
   * 获取用户偏好
   */
  private async getUserPreferences(userId: string): Promise<UserPreference> {
    const cacheKey = `user_preferences_${userId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // 从数据库获取用户行为数据
    const userBehavior = await this.getUserBehaviorData(userId);
    
    // 计算偏好
    const preferences: UserPreference = {
      userId,
      preferredExchanges: this.calculatePreferredExchanges(userBehavior),
      preferredFeatures: this.calculatePreferredFeatures(userBehavior),
      tradingStyle: this.inferTradingStyle(userBehavior),
      riskTolerance: this.inferRiskTolerance(userBehavior),
      engagementLevel: this.calculateEngagementLevel(userBehavior),
      priceSensitivity: this.calculatePriceSensitivity(userBehavior),
      technicalLevel: this.inferTechnicalLevel(userBehavior),
      lastUpdated: new Date()
    };

    // 缓存1小时
    await redis.setex(cacheKey, 3600, JSON.stringify(preferences));
    
    return preferences;
  }

  /**
   * 寻找相似用户
   */
  private async findSimilarUsers(userId: string, preferences: UserPreference): Promise<string[]> {
    const cacheKey = `similar_users_${userId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // 基于协同过滤寻找相似用户
    const similarUsers = await this.collaborativeFiltering(userId, preferences);
    
    // 缓存30分钟
    await redis.setex(cacheKey, 1800, JSON.stringify(similarUsers));
    
    return similarUsers;
  }

  /**
   * 生成推荐候选
   */
  private async generateRecommendationCandidates(
    userId: string,
    preferences: UserPreference,
    similarUsers: string[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const candidates: Recommendation[] = [];

    // 基于内容的推荐
    const contentBasedRecs = await this.generateContentBasedRecommendations(preferences, context);
    candidates.push(...contentBasedRecs);

    // 基于协同过滤的推荐
    const collaborativeRecs = await this.generateCollaborativeRecommendations(similarUsers, context);
    candidates.push(...collaborativeRecs);

    // 基于热门度的推荐
    const popularityRecs = await this.generatePopularityBasedRecommendations(context);
    candidates.push(...popularityRecs);

    // 基于业务规则的推荐
    const ruleBasedRecs = await this.generateRuleBasedRecommendations(preferences, context);
    candidates.push(...ruleBasedRecs);

    // 去重
    return this.deduplicateCandidates(candidates);
  }

  /**
   * 评分推荐
   */
  private async scoreRecommendations(
    candidates: Recommendation[],
    preferences: UserPreference,
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        let score = 0;

        // 用户偏好匹配分数
        const preferenceScore = this.calculatePreferenceScore(candidate, preferences);
        score += preferenceScore * 0.3;

        // 上下文相关性分数
        const contextScore = this.calculateContextScore(candidate, context);
        score += contextScore * 0.25;

        // 流行度分数
        const popularityScore = await this.calculatePopularityScore(candidate);
        score += popularityScore * 0.2;

        // 新颖性分数
        const noveltyScore = this.calculateNoveltyScore(candidate, preferences);
        score += noveltyScore * 0.15;

        // 业务价值分数
        const businessScore = this.calculateBusinessScore(candidate, preferences);
        score += businessScore * 0.1;

        return {
          ...candidate,
          score,
          confidence: Math.min(score, 1),
          reasoning: this.generateReasoning(candidate, preferences, context)
        };
      })
    );

    return scoredCandidates.sort((a, b) => b.score - a.score);
  }

  /**
   * 应用多样性和新颖性
   */
  private async applyDiversityAndNovelty(
    recommendations: Recommendation[],
    preferences: UserPreference,
    limit: number
  ): Promise<Recommendation[]> {
    const selected: Recommendation[] = [];
    const usedTypes = new Set<RecommendationType>();
    const usedExchanges = new Set<string>();

    for (const rec of recommendations) {
      if (selected.length >= limit) break;

      // 确保类型多样性
      if (usedTypes.has(rec.type) && usedTypes.size < 3) {
        continue;
      }

      // 确保交易所多样性
      if (rec.metadata?.exchange && usedExchanges.has(rec.metadata.exchange) && usedExchanges.size < 2) {
        continue;
      }

      selected.push(rec);
      usedTypes.add(rec.type);
      if (rec.metadata?.exchange) {
        usedExchanges.add(rec.metadata.exchange);
      }
    }

    // 如果还不够，继续添加
    if (selected.length < limit) {
      for (const rec of recommendations) {
        if (selected.length >= limit) break;
        if (!selected.includes(rec)) {
          selected.push(rec);
        }
      }
    }

    return selected;
  }

  /**
   * 更新推荐反馈
   */
  async updateRecommendationFeedback(
    userId: string,
    recommendationId: string,
    feedback: 'positive' | 'negative' | 'neutral',
    metadata?: any
  ): Promise<void> {
    try {
      // 保存反馈
      await prisma.recommendationFeedback.create({
        data: {
          userId,
          recommendationId,
          feedback,
          metadata: JSON.stringify(metadata),
          createdAt: new Date()
        }
      });

      // 更新用户偏好
      await this.updatePreferencesFromFeedback(userId, recommendationId, feedback);

      // 清除相关缓存
      await this.clearUserCache(userId);

      logger.info(`Updated recommendation feedback`, {
        userId,
        recommendationId,
        feedback
      });

    } catch (error) {
      logger.error('Failed to update recommendation feedback', error);
    }
  }

  /**
   * 获取实时推荐
   */
  async getRealTimeRecommendations(
    userId: string,
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    // 检查是否有实时触发条件
    const triggers = await this.checkRealTimeTriggers(userId, context);
    
    if (triggers.length > 0) {
      return this.generateTriggeredRecommendations(triggers, context);
    }

    return [];
  }

  /**
   * 协同过滤算法
   */
  private async collaborativeFiltering(userId: string, preferences: UserPreference): Promise<string[]> {
    // 简化的协同过滤实现
    const allUsers = await prisma.userPreference.findMany({
      where: { userId: { not: userId } }
    });

    const similarities = allUsers.map(user => ({
      userId: user.userId,
      similarity: this.calculateUserSimilarity(preferences, user)
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20)
      .map(s => s.userId);
  }

  /**
   * 计算用户相似度
   */
  private calculateUserSimilarity(user1: UserPreference, user2: any): number {
    let similarity = 0;
    let factors = 0;

    // 交易所偏好相似度
    const exchangeSimilarity = this.calculateJaccardSimilarity(
      user1.preferredExchanges,
      user2.preferredExchanges
    );
    similarity += exchangeSimilarity;
    factors++;

    // 功能偏好相似度
    const featureSimilarity = this.calculateJaccardSimilarity(
      user1.preferredFeatures,
      user2.preferredFeatures
    );
    similarity += featureSimilarity;
    factors++;

    // 交易风格相似度
    if (user1.tradingStyle === user2.tradingStyle) {
      similarity += 1;
    }
    factors++;

    return similarity / factors;
  }

  /**
   * Jaccard相似度计算
   */
  private calculateJaccardSimilarity(set1: string[], set2: string[]): number {
    const intersection = set1.filter(item => set2.includes(item)).length;
    const union = [...new Set([...set1, ...set2])].length;
    return intersection / union;
  }

  /**
   * 生成基于内容的推荐
   */
  private async generateContentBasedRecommendations(
    preferences: UserPreference,
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 基于偏好的交易所推荐
    for (const exchange of preferences.preferredExchanges) {
      recommendations.push({
        id: `exchange_rec_${exchange}`,
        type: 'exchange',
        title: `优化 ${exchange} 交易费用`,
        description: `基于您的交易习惯，我们推荐您使用 ${exchange} 的高级返佣计划`,
        score: 0,
        confidence: 0,
        metadata: { exchange },
        reasoning: '',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
    }

    // 基于功能偏好的推荐
    for (const feature of preferences.preferredFeatures) {
      recommendations.push({
        id: `feature_rec_${feature}`,
        type: 'feature',
        title: `探索 ${feature} 功能`,
        description: `您经常使用 ${feature}，发现这些高级功能可能对您有帮助`,
        score: 0,
        confidence: 0,
        metadata: { feature },
        reasoning: '',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * 生成协同过滤推荐
   */
  private async generateCollaborativeRecommendations(
    similarUsers: string[],
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    // 获取相似用户喜欢的推荐
    const popularRecs = await prisma.recommendationFeedback.groupBy({
      by: ['recommendationId'],
      where: {
        userId: { in: similarUsers },
        feedback: 'positive'
      },
      _count: { recommendationId: true },
      orderBy: { _count: { recommendationId: 'desc' } },
      take: 10
    });

    return popularRecs.map(rec => ({
      id: rec.recommendationId,
      type: 'collaborative',
      title: '其他用户也喜欢',
      description: '与您相似的用户对此推荐评价很高',
      score: 0,
      confidence: 0,
      metadata: { similarUserCount: rec._count.recommendationId },
      reasoning: '',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    }));
  }

  /**
   * 生成基于流行度的推荐
   */
  private async generatePopularityBasedRecommendations(
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    return [
      {
        id: 'popular_1',
        type: 'popular',
        title: '最受欢迎的返佣计划',
        description: '本月最受欢迎的交易返佣方案',
        score: 0,
        confidence: 0,
        metadata: { popularityRank: 1 },
        reasoning: '',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ];
  }

  /**
   * 生成基于规则的推荐
   */
  private async generateRuleBasedRecommendations(
    preferences: UserPreference,
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // 新用户推荐
    if (preferences.engagementLevel === 'low') {
      recommendations.push({
        id: 'new_user_guide',
        type: 'tutorial',
        title: '开始使用 ApexRebate',
        description: '了解如何最大化您的交易返佣',
        score: 0,
        confidence: 0,
        metadata: { isNewUser: true },
        reasoning: '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
    }

    // 高风险承受能力推荐
    if (preferences.riskTolerance === 'high') {
      recommendations.push({
        id: 'advanced_trading',
        type: 'advanced',
        title: '高级交易策略',
        description: '基于您的高风险承受能力，推荐这些高级策略',
        score: 0,
        confidence: 0,
        metadata: { riskLevel: 'high' },
        reasoning: '',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  /**
   * 辅助方法实现
   */
  private async getUserBehaviorData(userId: string): Promise<any> {
    // 实际实现中从数据库获取用户行为数据
    return {
      pageViews: 100,
      interactions: 50,
      sessionDuration: 1800,
      featuresUsed: ['dashboard', 'calculator'],
      exchangesUsed: ['binance', 'bybit']
    };
  }

  private calculatePreferredExchanges(behavior: any): string[] {
    return behavior.exchangesUsed || ['binance'];
  }

  private calculatePreferredFeatures(behavior: any): string[] {
    return behavior.featuresUsed || ['dashboard'];
  }

  private inferTradingStyle(behavior: any): string {
    return 'day_trading';
  }

  private inferRiskTolerance(behavior: any): string {
    return 'medium';
  }

  private calculateEngagementLevel(behavior: any): string {
    return behavior.sessionDuration > 1800 ? 'high' : 'low';
  }

  private calculatePriceSensitivity(behavior: any): string {
    return 'medium';
  }

  private inferTechnicalLevel(behavior: any): string {
    return 'intermediate';
  }

  private calculatePreferenceScore(rec: Recommendation, preferences: UserPreference): number {
    return Math.random(); // 简化实现
  }

  private calculateContextScore(rec: Recommendation, context: RecommendationContext): number {
    return Math.random(); // 简化实现
  }

  private async calculatePopularityScore(rec: Recommendation): Promise<number> {
    return Math.random(); // 简化实现
  }

  private calculateNoveltyScore(rec: Recommendation, preferences: UserPreference): number {
    return Math.random(); // 简化实现
  }

  private calculateBusinessScore(rec: Recommendation, preferences: UserPreference): number {
    return Math.random(); // 简化实现
  }

  private generateReasoning(rec: Recommendation, preferences: UserPreference, context: RecommendationContext): string {
    return `基于您的偏好和当前上下文推荐`;
  }

  private deduplicateCandidates(candidates: Recommendation[]): Recommendation[] {
    const seen = new Set<string>();
    return candidates.filter(rec => {
      if (seen.has(rec.id)) return false;
      seen.add(rec.id);
      return true;
    });
  }

  private getFallbackRecommendations(userId: string, context: RecommendationContext, limit: number): Recommendation[] {
    return [
      {
        id: 'fallback_1',
        type: 'general',
        title: '探索 ApexRebate',
        description: '发现更多交易返佣机会',
        score: 0.5,
        confidence: 0.3,
        metadata: {},
        reasoning: '默认推荐',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ];
  }

  private async logRecommendations(userId: string, recommendations: Recommendation[], context: RecommendationContext): Promise<void> {
    logger.info(`Logged recommendations for user ${userId}`, {
      count: recommendations.length,
      context
    });
  }

  private async updatePreferencesFromFeedback(userId: string, recommendationId: string, feedback: string): Promise<void> {
    // 实际实现中更新用户偏好
    logger.info(`Updating preferences from feedback`, { userId, recommendationId, feedback });
  }

  private async clearUserCache(userId: string): Promise<void> {
    const keys = [
      `user_preferences_${userId}`,
      `similar_users_${userId}`
    ];
    
    await Promise.all(keys.map(key => redis.del(key)));
  }

  private async checkRealTimeTriggers(userId: string, context: RecommendationContext): Promise<any[]> {
    // 检查实时触发条件
    return [];
  }

  private generateTriggeredRecommendations(triggers: any[], context: RecommendationContext): Recommendation[] {
    return [];
  }

  private initializeModels(): void {
    // 初始化机器学习模型
    logger.info('Initializing recommendation models');
  }

  private scheduleModelUpdates(): void {
    // 定期更新模型
    setInterval(() => {
      this.updateModels();
    }, 24 * 60 * 60 * 1000); // 每天更新一次
  }

  private async updateModels(): Promise<void> {
    try {
      logger.info('Updating recommendation models');
      this.lastModelUpdate = new Date();
    } catch (error) {
      logger.error('Failed to update models', error);
    }
  }
}

// 导出单例实例
export const recommendationEngine = IntelligentRecommendationEngine.getInstance();