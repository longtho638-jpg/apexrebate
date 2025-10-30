/**
 * 机器学习异常检测引擎 - 智能识别异常交易模式
 */

import { logger } from './logging';
import { db } from './db';

export interface TransactionPattern {
  userId: string;
  timestamp: Date;
  amount: number;
  type: 'buy' | 'sell' | 'transfer';
  exchange: string;
  pair: string;
  price: number;
  volume: number;
  metadata?: Record<string, any>;
}

export interface AnomalyAlert {
  id: string;
  userId: string;
  type: 'volume_spike' | 'price_deviation' | 'frequency_burst' | 'unusual_pattern' | 'security_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  title: string;
  description: string;
  detectedAt: Date;
  pattern: TransactionPattern;
  explanation: string;
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface UserBaseline {
  userId: string;
  avgTransactionAmount: number;
  avgTransactionFrequency: number; // per hour
  typicalPairs: string[];
  typicalExchanges: string[];
  volumeStdDev: number;
  frequencyStdDev: number;
  lastUpdated: Date;
  sampleSize: number;
}

export interface AnomalyDetectionConfig {
  enabled: boolean;
  sensitivity: number; // 0-1, higher = more sensitive
  minSampleSize: number;
  lookbackPeriod: number; // days
  alertThresholds: {
    volumeSpike: number; // multiplier of normal volume
    priceDeviation: number; // percentage
    frequencyBurst: number; // multiplier of normal frequency
  };
  realTimeAnalysis: boolean;
  batchAnalysisInterval: number; // minutes
}

class MLAnomalyDetector {
  private config: AnomalyDetectionConfig;
  private userBaselines: Map<string, UserBaseline> = new Map();
  private recentAlerts: Map<string, AnomalyAlert[]> = new Map();
  private isAnalyzing = false;

  constructor(config: AnomalyDetectionConfig) {
    this.config = config;
    this.initializeDetector();
  }

  // 初始化检测器
  private async initializeDetector(): Promise<void> {
    try {
      // 加载用户基线数据
      await this.loadUserBaselines();
      
      // 启动实时分析
      if (this.config.realTimeAnalysis) {
        this.startRealTimeAnalysis();
      }
      
      // 启动批量分析
      this.startBatchAnalysis();
      
      logger.info('ML Anomaly Detector initialized', {
        enabled: this.config.enabled,
        sensitivity: this.config.sensitivity,
        userBaselines: this.userBaselines.size
      });
    } catch (error) {
      logger.error('Failed to initialize ML Anomaly Detector', { 
        error: error.message 
      });
    }
  }

  // 加载用户基线
  private async loadUserBaselines(): Promise<void> {
    try {
      const baselines = await db.userBaseline.findMany();
      
      baselines.forEach(baseline => {
        this.userBaselines.set(baseline.userId, {
          userId: baseline.userId,
          avgTransactionAmount: baseline.avgTransactionAmount,
          avgTransactionFrequency: baseline.avgTransactionFrequency,
          typicalPairs: baseline.typicalPairs as string[],
          typicalExchanges: baseline.typicalExchanges as string[],
          volumeStdDev: baseline.volumeStdDev,
          frequencyStdDev: baseline.frequencyStdDev,
          lastUpdated: baseline.lastUpdated,
          sampleSize: baseline.sampleSize
        });
      });

      logger.info('User baselines loaded', {
        count: baselines.length
      });
    } catch (error) {
      logger.error('Failed to load user baselines', { error: error.message });
    }
  }

  // 分析交易模式
  async analyzeTransaction(transaction: TransactionPattern): Promise<AnomalyAlert[]> {
    if (!this.config.enabled) return [];

    try {
      const alerts: AnomalyAlert[] = [];
      const userId = transaction.userId;

      // 获取或创建用户基线
      let baseline = this.userBaselines.get(userId);
      if (!baseline || baseline.sampleSize < this.config.minSampleSize) {
        baseline = await this.buildUserBaseline(userId);
        if (baseline) {
          this.userBaselines.set(userId, baseline);
        }
      }

      if (!baseline) {
        // 没有足够的历史数据，无法进行异常检测
        return [];
      }

      // 检测各种异常模式
      const volumeAlert = this.detectVolumeSpike(transaction, baseline);
      if (volumeAlert) alerts.push(volumeAlert);

      const priceAlert = this.detectPriceDeviation(transaction, baseline);
      if (priceAlert) alerts.push(priceAlert);

      const frequencyAlert = this.detectFrequencyBurst(transaction, baseline);
      if (frequencyAlert) alerts.push(frequencyAlert);

      const patternAlert = this.detectUnusualPattern(transaction, baseline);
      if (patternAlert) alerts.push(patternAlert);

      const securityAlert = this.detectSecurityRisk(transaction, baseline);
      if (securityAlert) alerts.push(securityAlert);

      // 保存警报
      if (alerts.length > 0) {
        await this.saveAlerts(alerts);
        this.updateRecentAlerts(userId, alerts);
      }

      // 更新用户基线
      await this.updateUserBaseline(userId, transaction);

      return alerts;

    } catch (error) {
      logger.error('Failed to analyze transaction', { 
        error: error.message,
        transactionId: transaction.metadata?.id || 'unknown'
      });
      return [];
    }
  }

  // 构建用户基线
  private async buildUserBaseline(userId: string): Promise<UserBaseline | null> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.lookbackPeriod);

      const transactions = await db.exchangeTransaction.findMany({
        where: {
          userId,
          timestamp: { gte: cutoffDate }
        },
        orderBy: { timestamp: 'desc' }
      });

      if (transactions.length < this.config.minSampleSize) {
        return null;
      }

      // 计算统计数据
      const amounts = transactions.map(t => t.amount);
      const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length;
      const volumeStdDev = Math.sqrt(variance);

      // 计算交易频率
      const timeSpan = (transactions[0].timestamp.getTime() - transactions[transactions.length - 1].timestamp.getTime()) / (1000 * 60 * 60); // hours
      const avgFrequency = transactions.length / timeSpan;
      const frequencyVariance = this.calculateFrequencyVariance(transactions);
      const frequencyStdDev = Math.sqrt(frequencyVariance);

      // 获取典型的交易对和交易所
      const pairCounts = new Map<string, number>();
      const exchangeCounts = new Map<string, number>();

      transactions.forEach(t => {
        pairCounts.set(t.pair, (pairCounts.get(t.pair) || 0) + 1);
        exchangeCounts.set(t.exchange, (exchangeCounts.get(t.exchange) || 0) + 1);
      });

      const typicalPairs = Array.from(pairCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pair]) => pair);

      const typicalExchanges = Array.from(exchangeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([exchange]) => exchange);

      const baseline: UserBaseline = {
        userId,
        avgTransactionAmount: avgAmount,
        avgTransactionFrequency: avgFrequency,
        typicalPairs,
        typicalExchanges,
        volumeStdDev,
        frequencyStdDev,
        lastUpdated: new Date(),
        sampleSize: transactions.length
      };

      // 保存到数据库
      await db.userBaseline.upsert({
        where: { userId },
        update: baseline,
        create: baseline
      });

      return baseline;

    } catch (error) {
      logger.error('Failed to build user baseline', { userId, error: error.message });
      return null;
    }
  }

  // 计算频率方差
  private calculateFrequencyVariance(transactions: any[]): number {
    if (transactions.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      const interval = (transactions[i - 1].timestamp.getTime() - transactions[i].timestamp.getTime()) / (1000 * 60); // minutes
      intervals.push(interval);
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    return variance;
  }

  // 检测交易量激增
  private detectVolumeSpike(transaction: TransactionPattern, baseline: UserBaseline): AnomalyAlert | null {
    const threshold = this.config.alertThresholds.volumeSpike;
    const expectedMax = baseline.avgTransactionAmount + (baseline.volumeStdDev * 2);
    const actualAmount = transaction.amount;

    if (actualAmount > expectedMax * threshold) {
      const confidence = Math.min(1, (actualAmount - expectedMax) / (expectedMax * (threshold - 1)));
      
      return {
        id: `volume-spike-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: transaction.userId,
        type: 'volume_spike',
        severity: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
        confidence,
        title: '异常交易量激增',
        description: `检测到交易量 ${actualAmount.toFixed(2)} 远超正常水平 ${baseline.avgTransactionAmount.toFixed(2)}`,
        detectedAt: new Date(),
        pattern: transaction,
        explanation: `正常交易量范围: ${(baseline.avgTransactionAmount - baseline.volumeStdDev).toFixed(2)} - ${(baseline.avgTransactionAmount + baseline.volumeStdDev).toFixed(2)}`,
        recommendations: [
          '确认是否为本人操作',
          '检查账户安全性',
          '考虑设置交易限额'
        ],
        metadata: {
          expectedAmount: baseline.avgTransactionAmount,
          deviationMultiplier: actualAmount / baseline.avgTransactionAmount
        }
      };
    }

    return null;
  }

  // 检测价格偏差
  private detectPriceDeviation(transaction: TransactionPattern, baseline: UserBaseline): AnomalyAlert | null {
    // 获取市场价格数据（简化实现）
    const marketPrice = transaction.price; // 在实际环境中，这里会调用价格API
    const threshold = this.config.alertThresholds.priceDeviation;

    // 检查是否为不常见的交易对
    if (!baseline.typicalPairs.includes(transaction.pair)) {
      return {
        id: `price-deviation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: transaction.userId,
        type: 'price_deviation',
        severity: 'medium',
        confidence: 0.7,
        title: '异常交易对',
        description: `检测到不常见的交易对: ${transaction.pair}`,
        detectedAt: new Date(),
        pattern: transaction,
        explanation: `您通常交易的货币对: ${baseline.typicalPairs.join(', ')}`,
        recommendations: [
          '确认交易对是否正确',
          '了解该交易对的风险',
          '谨慎交易不熟悉的货币对'
        ],
        metadata: {
          unusualPair: transaction.pair,
          typicalPairs: baseline.typicalPairs
        }
      };
    }

    return null;
  }

  // 检测频率激增
  private async detectFrequencyBurst(transaction: TransactionPattern, baseline: UserBaseline): Promise<AnomalyAlert | null> {
    const threshold = this.config.alertThresholds.frequencyBurst;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      const recentTransactions = await db.exchangeTransaction.count({
        where: {
          userId: transaction.userId,
          timestamp: { gte: oneHourAgo }
        }
      });

      const expectedMax = baseline.avgTransactionFrequency + (baseline.frequencyStdDev * 2);
      
      if (recentTransactions > expectedMax * threshold) {
        const confidence = Math.min(1, (recentTransactions - expectedMax) / (expectedMax * (threshold - 1)));
        
        return {
          id: `frequency-burst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: transaction.userId,
          type: 'frequency_burst',
          severity: confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low',
          confidence,
          title: '异常交易频率',
          description: `过去1小时内进行了 ${recentTransactions} 笔交易，远超正常频率`,
          detectedAt: new Date(),
          pattern: transaction,
          explanation: `正常交易频率: ${baseline.avgTransactionFrequency.toFixed(2)} 笔/小时`,
          recommendations: [
            '确认所有交易均为本人操作',
            '检查账户是否被盗用',
            '考虑启用二次验证'
          ],
          metadata: {
            recentCount: recentTransactions,
            expectedFrequency: baseline.avgTransactionFrequency
          }
        };
      }
    } catch (error) {
      logger.error('Failed to detect frequency burst', { error: error.message });
    }

    return null;
  }

  // 检测异常模式
  private detectUnusualPattern(transaction: TransactionPattern, baseline: UserBaseline): AnomalyAlert | null {
    // 检查不常见的交易所
    if (!baseline.typicalExchanges.includes(transaction.exchange)) {
      return {
        id: `unusual-pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: transaction.userId,
        type: 'unusual_pattern',
        severity: 'low',
        confidence: 0.6,
        title: '异常交易所使用',
        description: `检测到不常用的交易所: ${transaction.exchange}`,
        detectedAt: new Date(),
        pattern: transaction,
        explanation: `您通常使用的交易所: ${baseline.typicalExchanges.join(', ')}`,
        recommendations: [
          '确认交易所安全性',
          '了解该交易所的费用结构',
          '谨慎使用新交易所'
        ],
        metadata: {
          unusualExchange: transaction.exchange,
          typicalExchanges: baseline.typicalExchanges
        }
      };
    }

    // 检查交易时间异常（深夜交易）
    const hour = transaction.timestamp.getHours();
    if (hour >= 2 && hour <= 5) {
      return {
        id: `unusual-pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: transaction.userId,
        type: 'unusual_pattern',
        severity: 'low',
        confidence: 0.5,
        title: '异常交易时间',
        description: `检测到深夜时段交易 (${hour}:00)`,
        detectedAt: new Date(),
        pattern: transaction,
        explanation: '深夜交易可能存在风险或表示紧急情况',
        recommendations: [
          '确认交易必要性',
          '注意疲劳交易风险',
          '考虑设置交易时间限制'
        ],
        metadata: {
          tradingHour: hour
        }
      };
    }

    return null;
  }

  // 检测安全风险
  private detectSecurityRisk(transaction: TransactionPattern, baseline: UserBaseline): AnomalyAlert | null {
    // 检测大额快速转账
    if (transaction.type === 'transfer' && transaction.amount > baseline.avgTransactionAmount * 10) {
      return {
        id: `security-risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: transaction.userId,
        type: 'security_risk',
        severity: 'high',
        confidence: 0.8,
        title: '潜在安全风险',
        description: `检测到异常大额转账: ${transaction.amount.toFixed(2)}`,
        detectedAt: new Date(),
        pattern: transaction,
        explanation: '大额快速转账可能是账户被盗用的迹象',
        recommendations: [
          '立即确认是否为本人操作',
          '如非本人操作，立即冻结账户',
          '联系客服并修改密码'
        ],
        metadata: {
          transferAmount: transaction.amount,
          riskLevel: 'high'
        }
      };
    }

    // 检测连续小额交易（可能的试探性攻击）
    const recentSmallTransactions = this.checkRecentSmallTransactions(transaction.userId);
    if (recentSmallTransactions > 20) { // 1小时内超过20笔小额交易
      return {
        id: `security-risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: transaction.userId,
        type: 'security_risk',
        severity: 'medium',
        confidence: 0.7,
        title: '可疑交易模式',
        description: `检测到连续小额交易 ${recentSmallTransactions} 笔`,
        detectedAt: new Date(),
        pattern: transaction,
        explanation: '连续小额交易可能是试探性攻击或测试账户权限',
        recommendations: [
          '检查账户活动日志',
          '确认所有交易均为本人操作',
          '考虑启用交易通知'
        ],
        metadata: {
          smallTransactionCount: recentSmallTransactions,
          riskLevel: 'medium'
        }
      };
    }

    return null;
  }

  // 检查最近的小额交易
  private async checkRecentSmallTransactions(userId: string): Promise<number> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const baseline = this.userBaselines.get(userId);
      
      if (!baseline) return 0;

      const count = await db.exchangeTransaction.count({
        where: {
          userId,
          timestamp: { gte: oneHourAgo },
          amount: { lt: baseline.avgTransactionAmount * 0.1 }
        }
      });

      return count;
    } catch (error) {
      logger.error('Failed to check recent small transactions', { error: error.message });
      return 0;
    }
  }

  // 保存警报
  private async saveAlerts(alerts: AnomalyAlert[]): Promise<void> {
    try {
      for (const alert of alerts) {
        await db.anomalyAlert.create({
          data: {
            id: alert.id,
            userId: alert.userId,
            type: alert.type,
            severity: alert.severity,
            confidence: alert.confidence,
            title: alert.title,
            description: alert.description,
            detectedAt: alert.detectedAt,
            pattern: alert.pattern as any,
            explanation: alert.explanation,
            recommendations: alert.recommendations,
            metadata: alert.metadata
          }
        });
      }

      logger.info('Anomaly alerts saved', { count: alerts.length });
    } catch (error) {
      logger.error('Failed to save anomaly alerts', { error: error.message });
    }
  }

  // 更新最近警报
  private updateRecentAlerts(userId: string, alerts: AnomalyAlert[]): void {
    if (!this.recentAlerts.has(userId)) {
      this.recentAlerts.set(userId, []);
    }

    const userAlerts = this.recentAlerts.get(userId)!;
    userAlerts.push(...alerts);

    // 只保留最近24小时的警报
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filteredAlerts = userAlerts.filter(alert => alert.detectedAt > oneDayAgo);
    
    this.recentAlerts.set(userId, filteredAlerts);
  }

  // 更新用户基线
  private async updateUserBaseline(userId: string, transaction: TransactionPattern): Promise<void> {
    try {
      const baseline = this.userBaselines.get(userId);
      if (!baseline) return;

      // 简单的增量更新（实际环境中可以使用更复杂的算法）
      const alpha = 0.1; // 学习率
      baseline.avgTransactionAmount = baseline.avgTransactionAmount * (1 - alpha) + transaction.amount * alpha;
      baseline.lastUpdated = new Date();
      baseline.sampleSize++;

      // 更新数据库
      await db.userBaseline.update({
        where: { userId },
        data: {
          avgTransactionAmount: baseline.avgTransactionAmount,
          lastUpdated: baseline.lastUpdated,
          sampleSize: baseline.sampleSize
        }
      });

    } catch (error) {
      logger.error('Failed to update user baseline', { error: error.message });
    }
  }

  // 启动实时分析
  private startRealTimeAnalysis(): void {
    // 这里可以设置WebSocket连接来监听实时交易
    logger.info('Real-time anomaly analysis started');
  }

  // 启动批量分析
  private startBatchAnalysis(): void {
    const intervalMs = this.config.batchAnalysisInterval * 60 * 1000;

    setInterval(async () => {
      if (this.isAnalyzing) return;
      
      this.isAnalyzing = true;
      try {
        await this.performBatchAnalysis();
      } catch (error) {
        logger.error('Batch analysis failed', { error: error.message });
      } finally {
        this.isAnalyzing = false;
      }
    }, intervalMs);

    logger.info('Batch anomaly analysis started', {
      interval: `${this.config.batchAnalysisInterval} minutes`
    });
  }

  // 执行批量分析
  private async performBatchAnalysis(): Promise<void> {
    try {
      // 获取最近未分析的交易
      const recentTime = new Date(Date.now() - this.config.batchAnalysisInterval * 60 * 1000);
      
      const transactions = await db.exchangeTransaction.findMany({
        where: {
          timestamp: { gte: recentTime },
          analyzed: false
        },
        take: 1000 // 限制批处理大小
      });

      let totalAlerts = 0;
      
      for (const transaction of transactions) {
        const alerts = await this.analyzeTransaction({
          userId: transaction.userId,
          timestamp: transaction.timestamp,
          amount: transaction.amount,
          type: transaction.type as any,
          exchange: transaction.exchange,
          pair: transaction.pair,
          price: transaction.price,
          volume: transaction.volume,
          metadata: transaction.metadata as any
        });
        
        totalAlerts += alerts.length;

        // 标记为已分析
        await db.exchangeTransaction.update({
          where: { id: transaction.id },
          data: { analyzed: true }
        });
      }

      if (totalAlerts > 0) {
        logger.info('Batch analysis completed', {
          transactionsAnalyzed: transactions.length,
          alertsDetected: totalAlerts
        });
      }

    } catch (error) {
      logger.error('Batch analysis failed', { error: error.message });
    }
  }

  // 获取用户警报
  async getUserAlerts(userId: string, severity?: string): Promise<AnomalyAlert[]> {
    try {
      const whereClause: any = { userId };
      if (severity) {
        whereClause.severity = severity;
      }

      const alerts = await db.anomalyAlert.findMany({
        where: whereClause,
        orderBy: { detectedAt: 'desc' },
        take: 50
      });

      return alerts.map(alert => ({
        id: alert.id,
        userId: alert.userId,
        type: alert.type as any,
        severity: alert.severity as any,
        confidence: alert.confidence,
        title: alert.title,
        description: alert.description,
        detectedAt: alert.detectedAt,
        pattern: alert.pattern as any,
        explanation: alert.explanation,
        recommendations: alert.recommendations as string[],
        metadata: alert.metadata as any
      }));

    } catch (error) {
      logger.error('Failed to get user alerts', { error: error.message });
      return [];
    }
  }

  // 获取系统统计
  async getSystemStats(): Promise<{
    totalAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    activeUsers: number;
    avgConfidence: number;
  }> {
    try {
      const totalAlerts = await db.anomalyAlert.count();
      const activeUsers = this.userBaselines.size;

      // 按类型统计
      const alertsByType = await db.anomalyAlert.groupBy({
        by: ['type'],
        _count: true
      });
      
      const typeStats: Record<string, number> = {};
      alertsByType.forEach(item => {
        typeStats[item.type] = item._count;
      });

      // 按严重程度统计
      const alertsBySeverity = await db.anomalyAlert.groupBy({
        by: ['severity'],
        _count: true
      });
      
      const severityStats: Record<string, number> = {};
      alertsBySeverity.forEach(item => {
        severityStats[item.severity] = item._count;
      });

      // 平均置信度
      const avgConfidenceResult = await db.anomalyAlert.aggregate({
        _avg: { confidence: true }
      });

      return {
        totalAlerts,
        alertsByType: typeStats,
        alertsBySeverity: severityStats,
        activeUsers,
        avgConfidence: avgConfidenceResult._avg.confidence || 0
      };

    } catch (error) {
      logger.error('Failed to get system stats', { error: error.message });
      return {
        totalAlerts: 0,
        alertsByType: {},
        alertsBySeverity: {},
        activeUsers: 0,
        avgConfidence: 0
      };
    }
  }

  // 更新配置
  updateConfig(updates: Partial<AnomalyDetectionConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('ML Anomaly Detector configuration updated', { config: this.config });
  }

  // 获取检测器状态
  getStatus(): {
    enabled: boolean;
    isAnalyzing: boolean;
    userBaselines: number;
    recentAlerts: number;
    config: AnomalyDetectionConfig;
  } {
    const totalRecentAlerts = Array.from(this.recentAlerts.values())
      .reduce((sum, alerts) => sum + alerts.length, 0);

    return {
      enabled: this.config.enabled,
      isAnalyzing: this.isAnalyzing,
      userBaselines: this.userBaselines.size,
      recentAlerts: totalRecentAlerts,
      config: this.config
    };
  }
}

// 创建默认配置
const defaultConfig: AnomalyDetectionConfig = {
  enabled: true,
  sensitivity: 0.7,
  minSampleSize: 30,
  lookbackPeriod: 30, // 30天
  alertThresholds: {
    volumeSpike: 3.0, // 3倍于正常交易量
    priceDeviation: 20, // 20%价格偏差
    frequencyBurst: 5.0 // 5倍于正常频率
  },
  realTimeAnalysis: true,
  batchAnalysisInterval: 15 // 15分钟
};

// 创建全局实例
export const mlAnomalyDetector = new MLAnomalyDetector(defaultConfig);

export default MLAnomalyDetector;