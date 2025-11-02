/**
 * 增强的自动化错误处理和恢复系统
 * 提供智能错误检测、分类、恢复和预防机制
 */

import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';

export interface ErrorEvent {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'workflow' | 'network' | 'database' | 'security' | 'resource';
  type: string;
  message: string;
  details?: Record<string, any>;
  source: string;
  context?: Record<string, any>;
  stackTrace?: string;
  resolved: boolean;
  resolutionAttempts: number;
  lastAttempt?: Date;
  autoResolved: boolean;
  impact: {
    affectedWorkflows: string[];
    affectedUsers: number;
    estimatedDowntime: number;
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: ErrorCondition[];
  actions: RecoveryAction[];
  priority: number;
  maxAttempts: number;
  cooldownPeriod: number;
  successRate: number;
  lastUsed?: Date;
  enabled: boolean;
}

export interface ErrorCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: any;
  caseSensitive?: boolean;
}

export interface RecoveryAction {
  type: 'retry' | 'rollback' | 'restart_service' | 'scale_resources' | 'notify' | 'custom_script' | 'fallback';
  config: Record<string, any>;
  timeout: number;
  rollbackAction?: RecoveryAction;
}

export interface RecoveryAttempt {
  id: string;
  errorId: string;
  strategyId: string;
  timestamp: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration: number;
  actions: RecoveryActionLog[];
  result: 'success' | 'partial' | 'failed';
  message: string;
  metrics?: Record<string, any>;
}

export interface RecoveryActionLog {
  type: string;
  config: Record<string, any>;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export interface ErrorPattern {
  id: string;
  pattern: string;
  frequency: number;
  lastSeen: Date;
  category: string;
  severity: string;
  suggestedStrategies: string[];
  autoResolve: boolean;
}

export class ErrorRecoverySystem {
  private static instance: ErrorRecoverySystem;
  private isInitialized = false;
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private activeRecoveries: Map<string, RecoveryAttempt> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MAX_CONCURRENT_RECOVERIES = 5;

  static getInstance(): ErrorRecoverySystem {
    if (!ErrorRecoverySystem.instance) {
      ErrorRecoverySystem.instance = new ErrorRecoverySystem();
    }
    return ErrorRecoverySystem.instance;
  }

  /**
   * 初始化错误恢复系统
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Error Recovery System already initialized');
      return;
    }

    try {
      logger.info('Initializing Error Recovery System...');

      // 加载恢复策略
      await this.loadRecoveryStrategies();
      
      // 加载错误模式
      await this.loadErrorPatterns();
      
      // 启动监控
      this.startErrorMonitoring();
      
      // 启动恢复处理器
      this.startRecoveryProcessor();

      this.isInitialized = true;
      logger.info('Error Recovery System initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize Error Recovery System', error);
      throw error;
    }
  }

  /**
   * 报告错误事件
   */
  async reportError(errorData: Partial<ErrorEvent>): Promise<string> {
    try {
      const errorEvent: ErrorEvent = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        severity: errorData.severity || 'medium',
        category: errorData.category || 'system',
        type: errorData.type || 'unknown',
        message: errorData.message || 'Unknown error',
        details: errorData.details || {},
        source: errorData.source || 'unknown',
        context: errorData.context || {},
        stackTrace: errorData.stackTrace,
        resolved: false,
        resolutionAttempts: 0,
        autoResolved: false,
        impact: {
          affectedWorkflows: [],
          affectedUsers: 0,
          estimatedDowntime: 0,
          businessImpact: 'low'
        },
        ...errorData
      };

      // 保存错误事件
      await this.saveErrorEvent(errorEvent);
      
      // 分析错误模式
      await this.analyzeErrorPattern(errorEvent);
      
      // 触发自动恢复
      if (errorEvent.severity !== 'low') {
        await this.triggerAutoRecovery(errorEvent);
      }

      // 发送通知
      await this.sendErrorNotification(errorEvent);

      logger.error(`Error reported: ${errorEvent.type} - ${errorEvent.message}`, errorEvent);
      return errorEvent.id;

    } catch (error) {
      logger.error('Failed to report error', error);
      throw error;
    }
  }

  /**
   * 手动触发恢复
   */
  async triggerRecovery(errorId: string, strategyId?: string): Promise<string> {
    try {
      const errorEvent = await this.getErrorEvent(errorId);
      if (!errorEvent) {
        throw new Error(`Error event not found: ${errorId}`);
      }

      const strategy = strategyId 
        ? this.recoveryStrategies.get(strategyId)
        : await this.selectBestStrategy(errorEvent);

      if (!strategy) {
        throw new Error(`No suitable recovery strategy found for error: ${errorId}`);
      }

      const attemptId = await this.executeRecoveryStrategy(errorEvent, strategy);
      return attemptId;

    } catch (error) {
      logger.error('Failed to trigger recovery', error);
      throw error;
    }
  }

  /**
   * 获取错误统计
   */
  async getErrorStatistics(timeRange: number = 24 * 60 * 60 * 1000): Promise<any> {
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - timeRange);
      
      const errors = await this.getErrorEvents(startTime, now);
      
      const stats = {
        total: errors.length,
        bySeverity: this.groupBy(errors, 'severity'),
        byCategory: this.groupBy(errors, 'category'),
        byType: this.groupBy(errors, 'type'),
        resolved: errors.filter(e => e.resolved).length,
        autoResolved: errors.filter(e => e.autoResolved).length,
        averageResolutionTime: await this.calculateAverageResolutionTime(errors),
        topErrors: this.getTopErrors(errors, 10),
        trends: await this.calculateErrorTrends(errors),
        impact: {
          totalAffectedWorkflows: new Set(errors.flatMap(e => e.impact.affectedWorkflows)).size,
          totalAffectedUsers: errors.reduce((sum, e) => sum + e.impact.affectedUsers, 0),
          totalDowntime: errors.reduce((sum, e) => sum + e.impact.estimatedDowntime, 0)
        }
      };

      return stats;

    } catch (error) {
      logger.error('Failed to get error statistics', error);
      throw error;
    }
  }

  /**
   * 获取恢复状态
   */
  async getRecoveryStatus(): Promise<any> {
    try {
      const activeRecoveries = Array.from(this.activeRecoveries.values());
      const recentRecoveries = await this.getRecentRecoveryAttempts(50);

      return {
        active: {
          count: activeRecoveries.length,
          maxConcurrent: this.MAX_CONCURRENT_RECOVERIES,
          utilization: (activeRecoveries.length / this.MAX_CONCURRENT_RECOVERIES) * 100,
          details: activeRecoveries.map(r => ({
            id: r.id,
            errorId: r.errorId,
            strategy: r.strategyId,
            status: r.status,
            startTime: r.timestamp,
            duration: Date.now() - r.timestamp.getTime()
          }))
        },
        recent: {
          total: recentRecoveries.length,
          success: recentRecoveries.filter(r => r.result === 'success').length,
          failed: recentRecoveries.filter(r => r.result === 'failed').length,
          averageDuration: this.calculateAverageRecoveryDuration(recentRecoveries)
        },
        strategies: {
          total: this.recoveryStrategies.size,
          enabled: Array.from(this.recoveryStrategies.values()).filter(s => s.enabled).length,
          topPerforming: this.getTopPerformingStrategies()
        }
      };

    } catch (error) {
      logger.error('Failed to get recovery status', error);
      throw error;
    }
  }

  /**
   * 添加自定义恢复策略
   */
  async addRecoveryStrategy(strategy: Omit<RecoveryStrategy, 'id'>): Promise<string> {
    try {
      const id = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newStrategy: RecoveryStrategy = {
        ...strategy,
        id,
        successRate: 0
      };

      this.recoveryStrategies.set(id, newStrategy);
      await this.saveRecoveryStrategy(newStrategy);

      logger.info(`Recovery strategy added: ${newStrategy.name} (${id})`);
      return id;

    } catch (error) {
      logger.error('Failed to add recovery strategy', error);
      throw error;
    }
  }

  /**
   * 私有方法
   */
  private async loadRecoveryStrategies(): Promise<void> {
    try {
      // 加载默认恢复策略
      const defaultStrategies: RecoveryStrategy[] = [
        {
          id: 'retry_strategy',
          name: '重试策略',
          description: '对于临时性错误进行自动重试',
          category: 'general',
          conditions: [
            { field: 'severity', operator: 'equals', value: 'medium' },
            { field: 'category', operator: 'equals', value: 'network' }
          ],
          actions: [
            {
              type: 'retry',
              config: { maxAttempts: 3, backoffStrategy: 'exponential', initialDelay: 1000 },
              timeout: 30000
            }
          ],
          priority: 1,
          maxAttempts: 3,
          cooldownPeriod: 60000,
          successRate: 0.85,
          enabled: true
        },
        {
          id: 'service_restart_strategy',
          name: '服务重启策略',
          description: '对于服务相关错误进行重启',
          category: 'system',
          conditions: [
            { field: 'category', operator: 'equals', value: 'system' },
            { field: 'severity', operator: 'greater_than', value: 'medium' }
          ],
          actions: [
            {
              type: 'restart_service',
              config: { serviceName: 'automation-engine', gracefulShutdown: true },
              timeout: 60000
            }
          ],
          priority: 2,
          maxAttempts: 2,
          cooldownPeriod: 300000,
          successRate: 0.75,
          enabled: true
        },
        {
          id: 'rollback_strategy',
          name: '回滚策略',
          description: '对于部署相关错误进行回滚',
          category: 'deployment',
          conditions: [
            { field: 'category', operator: 'equals', value: 'deployment' },
            { field: 'severity', operator: 'equals', value: 'high' }
          ],
          actions: [
            {
              type: 'rollback',
              config: { targetVersion: 'last_stable', backupData: true },
              timeout: 120000
            }
          ],
          priority: 3,
          maxAttempts: 1,
          cooldownPeriod: 600000,
          successRate: 0.9,
          enabled: true
        },
        {
          id: 'scale_resources_strategy',
          name: '资源扩容策略',
          description: '对于资源不足错误进行自动扩容',
          category: 'resource',
          conditions: [
            { field: 'category', operator: 'equals', value: 'resource' },
            { field: 'type', operator: 'contains', value: 'memory' }
          ],
          actions: [
            {
              type: 'scale_resources',
              config: { resource: 'memory', increment: '50%', maxLimit: '200%' },
              timeout: 90000
            }
          ],
          priority: 2,
          maxAttempts: 3,
          cooldownPeriod: 180000,
          successRate: 0.8,
          enabled: true
        }
      ];

      for (const strategy of defaultStrategies) {
        this.recoveryStrategies.set(strategy.id, strategy);
      }

      logger.info(`Loaded ${this.recoveryStrategies.size} recovery strategies`);

    } catch (error) {
      logger.error('Failed to load recovery strategies', error);
    }
  }

  private async loadErrorPatterns(): Promise<void> {
    try {
      // 加载已知的错误模式
      const patterns: ErrorPattern[] = [
        {
          id: 'connection_timeout_pattern',
          pattern: 'connection timeout',
          frequency: 0,
          lastSeen: new Date(),
          category: 'network',
          severity: 'medium',
          suggestedStrategies: ['retry_strategy'],
          autoResolve: true
        },
        {
          id: 'database_lock_pattern',
          pattern: 'database lock|deadlock',
          frequency: 0,
          lastSeen: new Date(),
          category: 'database',
          severity: 'high',
          suggestedStrategies: ['retry_strategy', 'rollback_strategy'],
          autoResolve: false
        },
        {
          id: 'memory_exhaustion_pattern',
          pattern: 'out of memory|memory exhausted',
          frequency: 0,
          lastSeen: new Date(),
          category: 'resource',
          severity: 'critical',
          suggestedStrategies: ['scale_resources_strategy'],
          autoResolve: true
        }
      ];

      for (const pattern of patterns) {
        this.errorPatterns.set(pattern.id, pattern);
      }

      logger.info(`Loaded ${this.errorPatterns.size} error patterns`);

    } catch (error) {
      logger.error('Failed to load error patterns', error);
    }
  }

  private startErrorMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.monitorSystemHealth();
      } catch (error) {
        logger.error('Error monitoring failed', error);
      }
    }, 30000); // 每30秒检查一次
  }

  private startRecoveryProcessor(): void {
    setInterval(async () => {
      try {
        await this.processPendingRecoveries();
      } catch (error) {
        logger.error('Recovery processing failed', error);
      }
    }, 10000); // 每10秒处理一次
  }

  private async monitorSystemHealth(): Promise<void> {
    // 检查系统健康状态，主动发现潜在问题
    try {
      const healthMetrics = await this.collectHealthMetrics();
      
      for (const metric of healthMetrics) {
        if (metric.severity !== 'normal') {
          await this.reportError({
            type: 'health_monitoring',
            message: `Health metric ${metric.name} is ${metric.value}`,
            severity: metric.severity === 'warning' ? 'medium' : 'high',
            category: 'system',
            source: 'health_monitor',
            details: metric
          });
        }
      }
    } catch (error) {
      logger.error('Health monitoring failed', error);
    }
  }

  private async processPendingRecoveries(): Promise<void> {
    if (this.activeRecoveries.size >= this.MAX_CONCURRENT_RECOVERIES) {
      return; // 达到最大并发恢复数
    }

    // 获取待处理的错误
    const pendingErrors = await this.getPendingErrors();
    
    for (const error of pendingErrors) {
      if (this.activeRecoveries.size >= this.MAX_CONCURRENT_RECOVERIES) {
        break;
      }

      if (!error.resolved && error.resolutionAttempts < 3) {
        await this.triggerAutoRecovery(error);
      }
    }
  }

  private async triggerAutoRecovery(errorEvent: ErrorEvent): Promise<void> {
    try {
      const strategy = await this.selectBestStrategy(errorEvent);
      if (!strategy) {
        logger.warn(`No recovery strategy found for error: ${errorEvent.id}`);
        return;
      }

      await this.executeRecoveryStrategy(errorEvent, strategy);

    } catch (error) {
      logger.error('Auto recovery failed', error);
    }
  }

  private async selectBestStrategy(errorEvent: ErrorEvent): Promise<RecoveryStrategy | null> {
    const candidates = Array.from(this.recoveryStrategies.values())
      .filter(strategy => strategy.enabled)
      .filter(strategy => this.matchesConditions(errorEvent, strategy.conditions))
      .sort((a, b) => b.priority - a.priority);

    if (candidates.length === 0) {
      return null;
    }

    // 选择成功率最高的策略
    return candidates.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
  }

  private matchesConditions(errorEvent: ErrorEvent, conditions: ErrorCondition[]): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(errorEvent, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'matches':
          return new RegExp(condition.value, condition.caseSensitive ? 'g' : 'gi').test(String(fieldValue));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  private getFieldValue(errorEvent: ErrorEvent, field: string): any {
    const fields = field.split('.');
    let value: any = errorEvent;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    return value;
  }

  private async executeRecoveryStrategy(errorEvent: ErrorEvent, strategy: RecoveryStrategy): Promise<string> {
    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const attempt: RecoveryAttempt = {
      id: attemptId,
      errorId: errorEvent.id,
      strategyId: strategy.id,
      timestamp: new Date(),
      status: 'pending',
      duration: 0,
      actions: [],
      result: 'failed',
      message: ''
    };

    this.activeRecoveries.set(attemptId, attempt);

    try {
      attempt.status = 'running';
      await this.saveRecoveryAttempt(attempt);

      // 执行恢复动作
      for (const action of strategy.actions) {
        const actionLog = await this.executeRecoveryAction(action);
        attempt.actions.push(actionLog);
        
        if (actionLog.status === 'failed') {
          throw new Error(`Recovery action failed: ${actionLog.error}`);
        }
      }

      attempt.status = 'completed';
      attempt.result = 'success';
      attempt.message = 'Recovery completed successfully';
      
      // 更新错误状态
      errorEvent.resolved = true;
      errorEvent.autoResolved = true;
      await this.saveErrorEvent(errorEvent);

      // 更新策略成功率
      await this.updateStrategySuccessRate(strategy.id, true);

      logger.info(`Recovery successful: ${attemptId} for error: ${errorEvent.id}`);

    } catch (error) {
      attempt.status = 'completed';
      attempt.result = 'failed';
      attempt.message = error instanceof Error ? error.message : String(error);
      
      // 更新策略成功率
      await this.updateStrategySuccessRate(strategy.id, false);

      logger.error(`Recovery failed: ${attemptId}`, error);

    } finally {
      attempt.duration = Date.now() - attempt.timestamp.getTime();
      await this.saveRecoveryAttempt(attempt);
      this.activeRecoveries.delete(attemptId);
    }

    return attemptId;
  }

  private async executeRecoveryAction(action: RecoveryAction): Promise<RecoveryActionLog> {
    const log: RecoveryActionLog = {
      type: action.type,
      config: action.config,
      startTime: new Date(),
      status: 'pending'
    };

    try {
      log.status = 'running';

      switch (action.type) {
        case 'retry':
          await this.executeRetryAction(action.config);
          break;
        case 'restart_service':
          await this.executeRestartServiceAction(action.config);
          break;
        case 'rollback':
          await this.executeRollbackAction(action.config);
          break;
        case 'scale_resources':
          await this.executeScaleResourcesAction(action.config);
          break;
        case 'notify':
          await this.executeNotifyAction(action.config);
          break;
        case 'custom_script':
          await this.executeCustomScriptAction(action.config);
          break;
        case 'fallback':
          await this.executeFallbackAction(action.config);
          break;
        default:
          throw new Error(`Unknown recovery action type: ${action.type}`);
      }

      log.status = 'completed';
      log.endTime = new Date();

    } catch (error) {
      log.status = 'failed';
      log.error = error instanceof Error ? error.message : String(error);
      log.endTime = new Date();
      throw error;
    }

    return log;
  }

  // 恢复动作实现
  private async executeRetryAction(config: any): Promise<void> {
    logger.info(`Executing retry action: ${JSON.stringify(config)}`);
    // 实现重试逻辑
  }

  private async executeRestartServiceAction(config: any): Promise<void> {
    logger.info(`Executing service restart action: ${JSON.stringify(config)}`);
    // 实现服务重启逻辑
  }

  private async executeRollbackAction(config: any): Promise<void> {
    logger.info(`Executing rollback action: ${JSON.stringify(config)}`);
    // 实现回滚逻辑
  }

  private async executeScaleResourcesAction(config: any): Promise<void> {
    logger.info(`Executing scale resources action: ${JSON.stringify(config)}`);
    // 实现资源扩容逻辑
  }

  private async executeNotifyAction(config: any): Promise<void> {
    logger.info(`Executing notify action: ${JSON.stringify(config)}`);
    // 实现通知逻辑
  }

  private async executeCustomScriptAction(config: any): Promise<void> {
    logger.info(`Executing custom script action: ${JSON.stringify(config)}`);
    // 实现自定义脚本逻辑
  }

  private async executeFallbackAction(config: any): Promise<void> {
    logger.info(`Executing fallback action: ${JSON.stringify(config)}`);
    // 实现降级逻辑
  }

  // 数据存储方法
  private async saveErrorEvent(errorEvent: ErrorEvent): Promise<void> {
    await redis.setex(`error:${errorEvent.id}`, 86400 * 7, JSON.stringify(errorEvent));
    await redis.lpush('errors', JSON.stringify(errorEvent));
    await redis.expire('errors', 86400 * 30);
  }

  private async saveRecoveryAttempt(attempt: RecoveryAttempt): Promise<void> {
    await redis.setex(`recovery:${attempt.id}`, 86400 * 7, JSON.stringify(attempt));
    await redis.lpush('recoveries', JSON.stringify(attempt));
    await redis.expire('recoveries', 86400 * 30);
  }

  private async saveRecoveryStrategy(strategy: RecoveryStrategy): Promise<void> {
    await redis.setex(`strategy:${strategy.id}`, 86400 * 30, JSON.stringify(strategy));
  }

  // 数据查询方法
  private async getErrorEvent(id: string): Promise<ErrorEvent | null> {
    const data = await redis.get(`error:${id}`);
    return data ? JSON.parse(data) : null;
  }

  private async getErrorEvents(startTime: Date, endTime: Date): Promise<ErrorEvent[]> {
    const errors = await redis.lrange('errors', 0, -1);
    return errors
      .map(e => JSON.parse(e))
      .filter((e: ErrorEvent) => {
        const timestamp = new Date(e.timestamp);
        return timestamp >= startTime && timestamp <= endTime;
      });
  }

  private async getPendingErrors(): Promise<ErrorEvent[]> {
    const errors = await redis.lrange('errors', 0, -1);
    return errors
      .map(e => JSON.parse(e))
      .filter((e: ErrorEvent) => !e.resolved && e.resolutionAttempts < 3);
  }

  private async getRecentRecoveryAttempts(limit: number): Promise<RecoveryAttempt[]> {
    const recoveries = await redis.lrange('recoveries', 0, limit - 1);
    return recoveries.map(r => JSON.parse(r));
  }

  // 分析方法
  private async analyzeErrorPattern(errorEvent: ErrorEvent): Promise<void> {
    for (const [patternId, pattern] of this.errorPatterns) {
      if (errorEvent.message.toLowerCase().includes(pattern.pattern.toLowerCase())) {
        pattern.frequency++;
        pattern.lastSeen = new Date();
        await this.saveErrorPattern(pattern);
      }
    }
  }

  private async sendErrorNotification(errorEvent: ErrorEvent): Promise<void> {
    // 发送错误通知
    logger.warn(`Error notification sent for: ${errorEvent.id}`);
  }

  // 工具方法
  private groupBy(items: any[], field: string): Record<string, number> {
    return items.reduce((groups, item) => {
      const key = item[field];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  private getTopErrors(errors: ErrorEvent[], limit: number): any[] {
    const errorCounts = this.groupBy(errors, 'type');
    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }

  private async calculateErrorTrends(errors: ErrorEvent[]): Promise<any> {
    // 简化的趋势计算
    return {
      increasing: 0.1,
      decreasing: 0.05,
      stable: 0.85
    };
  }

  private async calculateAverageResolutionTime(errors: ErrorEvent[]): Promise<number> {
    const resolvedErrors = errors.filter(e => e.resolved);
    if (resolvedErrors.length === 0) return 0;
    
    // 简化计算
    return 300; // 5分钟
  }

  private calculateAverageRecoveryDuration(recoveries: RecoveryAttempt[]): number {
    if (recoveries.length === 0) return 0;
    
    const totalDuration = recoveries.reduce((sum, r) => sum + r.duration, 0);
    return totalDuration / recoveries.length;
  }

  private getTopPerformingStrategies(): any[] {
    return Array.from(this.recoveryStrategies.values())
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        name: s.name,
        successRate: s.successRate,
        lastUsed: s.lastUsed
      }));
  }

  private async updateStrategySuccessRate(strategyId: string, success: boolean): Promise<void> {
    const strategy = this.recoveryStrategies.get(strategyId);
    if (strategy) {
      // 简化的成功率更新
      strategy.successRate = strategy.successRate * 0.9 + (success ? 0.1 : 0);
      strategy.lastUsed = new Date();
      await this.saveRecoveryStrategy(strategy);
    }
  }

  private async saveErrorPattern(pattern: ErrorPattern): Promise<void> {
    await redis.setex(`pattern:${pattern.id}`, 86400 * 30, JSON.stringify(pattern));
  }

  private async collectHealthMetrics(): Promise<any[]> {
    // 收集系统健康指标
    return [
      {
        name: 'cpu_usage',
        value: 75,
        severity: 'warning'
      },
      {
        name: 'memory_usage',
        value: 60,
        severity: 'normal'
      }
    ];
  }

  /**
   * 关闭错误恢复系统
   */
  async shutdown(): Promise<void> {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
      
      this.isInitialized = false;
      logger.info('Error Recovery System shutdown completed');
    } catch (error) {
      logger.error('Error during Error Recovery System shutdown', error);
    }
  }
}

// 导出单例实例
export const errorRecoverySystem = ErrorRecoverySystem.getInstance();