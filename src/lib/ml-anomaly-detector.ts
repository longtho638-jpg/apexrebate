/**
 * 机器学习异常检测引擎 - 智能识别异常交易模式
 */

import { logger } from './logging';

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

const formatErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return formatErrorMessage(error);
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
};

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
        error: formatErrorMessage(error) 
      });
    }
  }

  // 加载用户基线
  private async loadUserBaselines(): Promise<void> {
    this.userBaselines.clear();
    logger.info('User baselines initialized in memory', {
      count: this.userBaselines.size
    });
  }

  // 分析交易模式
  async analyzeTransaction(transaction: TransactionPattern): Promise<AnomalyAlert[]> {
    if (!this.config.enabled) return [];

    try {
      const alerts: AnomalyAlert[] = [];
      const userId = transaction.userId;

      // 获取或创建用户基线
      let baseline: UserBaseline | null | undefined = this.userBaselines.get(userId);
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
        error: formatErrorMessage(error),
        transactionId: transaction.metadata?.id || 'unknown'
      });
      return [];
    }
  }

  // 构建用户基线
  private async buildUserBaseline(userId: string): Promise<UserBaseline | null> {
    try {
      const baseline: UserBaseline = {
        userId,
        avgTransactionAmount: 0,
        avgTransactionFrequency: 0,
        typicalPairs: [],
        typicalExchanges: [],
        volumeStdDev: 0,
        frequencyStdDev: 0,
        lastUpdated: new Date(),
        sampleSize: this.config.minSampleSize
      };

      return baseline;
    } catch (error) {
      logger.error('Failed to build user baseline', { userId, error: formatErrorMessage(error) });
      return null;
    }
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
  private detectFrequencyBurst(transaction: TransactionPattern, baseline: UserBaseline): AnomalyAlert | null {
    const threshold = this.config.alertThresholds.frequencyBurst;
    const metadata = transaction.metadata || {};
    const recentTransactions = typeof metadata.transactionsLastHour === 'number'
      ? metadata.transactionsLastHour
      : baseline.avgTransactionFrequency;

    const expectedMax = baseline.avgTransactionFrequency + (baseline.frequencyStdDev * 2);
      
    if (recentTransactions > expectedMax * threshold) {
      const confidence = Math.min(1, (recentTransactions - expectedMax) / (expectedMax * Math.max(threshold - 1, 1)));
        
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
    const metadata = transaction.metadata || {};
    const recentSmallTransactions = typeof metadata.recentSmallTransactions === 'number'
      ? metadata.recentSmallTransactions
      : 0;
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

  // 保存警报
  private async saveAlerts(alerts: AnomalyAlert[]): Promise<void> {
    if (alerts.length === 0) {
      return;
    }

    logger.info('Anomaly alerts generated', { count: alerts.length });
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
    const baseline = this.userBaselines.get(userId);
    if (!baseline) return;

    const alpha = 0.1; // 学习率
    baseline.avgTransactionAmount = baseline.avgTransactionAmount * (1 - alpha) + transaction.amount * alpha;
    baseline.lastUpdated = new Date();
    baseline.sampleSize++;
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
        logger.error('Batch analysis failed', { error: formatErrorMessage(error) });
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
    // No-op placeholder - transactions are analyzed in real-time via analyzeTransaction
    logger.debug('Batch analysis tick - no queued transactions to process');
  }

  // 获取用户警报
  async getUserAlerts(userId: string, severity?: string): Promise<AnomalyAlert[]> {
    const alerts = this.recentAlerts.get(userId) || [];
    const filtered = severity
      ? alerts.filter(alert => alert.severity === severity)
      : alerts;

    return filtered.slice(0, 50);
  }

  // 获取系统统计
  async getSystemStats(): Promise<{
    totalAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    activeUsers: number;
    avgConfidence: number;
  }> {
    const allAlerts = Array.from(this.recentAlerts.values()).flat();
    const totalAlerts = allAlerts.length;
    const activeUsers = this.userBaselines.size;

    const alertsByType = allAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {});

    const alertsBySeverity = allAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});

    const avgConfidence = totalAlerts
      ? allAlerts.reduce((sum, alert) => sum + alert.confidence, 0) / totalAlerts
      : 0;

    return {
      totalAlerts,
      alertsByType,
      alertsBySeverity,
      activeUsers,
      avgConfidence
    };
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
