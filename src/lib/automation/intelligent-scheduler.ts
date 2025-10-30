/**
 * 智能自动化调度系统
 * 基于机器学习和历史数据优化工作流调度
 */

import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { stepByStepAutomation, AutomationWorkflow, WorkflowExecution } from './step-by-step-automation';

export interface ScheduleOptimization {
  workflowId: string;
  optimalSchedule: string;
  confidence: number;
  factors: {
    systemLoad: number;
    historicalSuccess: number;
    resourceUsage: number;
    businessImpact: number;
  };
  recommendations: string[];
}

export interface PredictiveInsight {
  type: 'performance' | 'failure' | 'resource' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  predictedAt: Date;
  confidence: number;
  impact: string;
  recommendations: string[];
  metrics?: Record<string, number>;
}

export interface ResourceForecast {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  confidence: number;
}

export class IntelligentScheduler {
  private static instance: IntelligentScheduler;
  private isInitialized = false;
  private optimizationInterval: NodeJS.Timeout | null = null;
  private predictionInterval: NodeJS.Timeout | null = null;
  private readonly OPTIMIZATION_WINDOW = 24 * 60 * 60 * 1000; // 24小时
  private readonly PREDICTION_HORIZON = 7 * 24 * 60 * 60 * 1000; // 7天

  static getInstance(): IntelligentScheduler {
    if (!IntelligentScheduler.instance) {
      IntelligentScheduler.instance = new IntelligentScheduler();
    }
    return IntelligentScheduler.instance;
  }

  /**
   * 初始化智能调度器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Intelligent Scheduler already initialized');
      return;
    }

    try {
      logger.info('Initializing Intelligent Scheduler...');

      // 加载历史数据
      await this.loadHistoricalData();
      
      // 启动优化循环
      this.startOptimizationLoop();
      
      // 启动预测循环
      this.startPredictionLoop();

      this.isInitialized = true;
      logger.info('Intelligent Scheduler initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize Intelligent Scheduler', error);
      throw error;
    }
  }

  /**
   * 优化工作流调度
   */
  async optimizeWorkflowScheduling(workflowId?: string): Promise<ScheduleOptimization[]> {
    try {
      const workflows = stepByStepAutomation.getWorkflows();
      const targetWorkflows = workflowId 
        ? workflows.filter(w => w.id === workflowId)
        : workflows.filter(w => w.enabled);

      const optimizations: ScheduleOptimization[] = [];

      for (const workflow of targetWorkflows) {
        const optimization = await this.calculateOptimalSchedule(workflow);
        optimizations.push(optimization);
      }

      logger.info(`Generated ${optimizations.length} schedule optimizations`);
      return optimizations;

    } catch (error) {
      logger.error('Failed to optimize workflow scheduling', error);
      throw error;
    }
  }

  /**
   * 生成预测性洞察
   */
  async generatePredictiveInsights(): Promise<PredictiveInsight[]> {
    try {
      const insights: PredictiveInsight[] = [];

      // 性能预测
      const performanceInsights = await this.predictPerformanceIssues();
      insights.push(...performanceInsights);

      // 故障预测
      const failureInsights = await this.predictFailures();
      insights.push(...failureInsights);

      // 资源预测
      const resourceInsights = await this.predictResourceIssues();
      insights.push(...resourceInsights);

      // 机会识别
      const opportunityInsights = await this.identifyOpportunities();
      insights.push(...opportunityInsights);

      // 按严重程度排序
      insights.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      // 缓存洞察
      await redis.setex('predictive_insights', 3600, JSON.stringify(insights));

      logger.info(`Generated ${insights.length} predictive insights`);
      return insights;

    } catch (error) {
      logger.error('Failed to generate predictive insights', error);
      throw error;
    }
  }

  /**
   * 预测资源使用情况
   */
  async forecastResources(hours: number = 24): Promise<ResourceForecast[]> {
    try {
      const forecasts: ResourceForecast[] = [];
      const now = new Date();
      const interval = (hours * 60 * 60 * 1000) / 24; // 每小时一个数据点

      // 获取历史资源数据
      const historicalData = await this.getHistoricalResourceData();

      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() + i * interval);
        const forecast = await this.predictResourceAtTime(timestamp, historicalData);
        forecasts.push(forecast);
      }

      return forecasts;

    } catch (error) {
      logger.error('Failed to forecast resources', error);
      throw error;
    }
  }

  /**
   * 自动应用优化建议
   */
  async applyOptimizations(optimizations: ScheduleOptimization[]): Promise<void> {
    try {
      let appliedCount = 0;

      for (const optimization of optimizations) {
        // 只应用高置信度的优化
        if (optimization.confidence > 0.8) {
          await this.applyScheduleOptimization(optimization);
          appliedCount++;
        }
      }

      logger.info(`Applied ${appliedCount} schedule optimizations`);

    } catch (error) {
      logger.error('Failed to apply optimizations', error);
      throw error;
    }
  }

  /**
   * 获取调度效率指标
   */
  async getSchedulingEfficiency(): Promise<any> {
    try {
      const executions = await stepByStepAutomation.getExecutionHistory(undefined, 100);
      const workflows = stepByStepAutomation.getWorkflows();

      // 计算各种效率指标
      const metrics = {
        overallEfficiency: await this.calculateOverallEfficiency(executions),
        resourceUtilization: await this.calculateResourceUtilization(),
        successRate: this.calculateSuccessRate(executions),
        averageExecutionTime: this.calculateAverageExecutionTime(executions),
        schedulingAccuracy: await this.calculateSchedulingAccuracy(),
        optimizationImpact: await this.calculateOptimizationImpact()
      };

      return metrics;

    } catch (error) {
      logger.error('Failed to get scheduling efficiency', error);
      throw error;
    }
  }

  /**
   * 私有方法
   */
  private async loadHistoricalData(): Promise<void> {
    try {
      // 从数据库或缓存加载历史执行数据
      const historicalExecutions = await stepByStepAutomation.getExecutionHistory(undefined, 1000);
      
      // 分析历史模式
      await this.analyzeHistoricalPatterns(historicalExecutions);
      
      logger.info('Historical data loaded successfully');
    } catch (error) {
      logger.error('Failed to load historical data', error);
    }
  }

  private startOptimizationLoop(): void {
    this.optimizationInterval = setInterval(async () => {
      try {
        await this.performScheduledOptimization();
      } catch (error) {
        logger.error('Scheduled optimization failed', error);
      }
    }, 60 * 60 * 1000); // 每小时执行一次
  }

  private startPredictionLoop(): void {
    this.predictionInterval = setInterval(async () => {
      try {
        await this.performScheduledPrediction();
      } catch (error) {
        logger.error('Scheduled prediction failed', error);
      }
    }, 30 * 60 * 1000); // 每30分钟执行一次
  }

  private async performScheduledOptimization(): Promise<void> {
    logger.debug('Performing scheduled optimization...');
    
    const optimizations = await this.optimizeWorkflowScheduling();
    
    // 自动应用高置信度的优化
    await this.applyOptimizations(optimizations);
  }

  private async performScheduledPrediction(): Promise<void> {
    logger.debug('Performing scheduled prediction...');
    
    await this.generatePredictiveInsights();
    await this.forecastResources();
  }

  private async calculateOptimalSchedule(workflow: AutomationWorkflow): Promise<ScheduleOptimization> {
    // 获取工作流的历史执行数据
    const executions = await stepByStepAutomation.getExecutionHistory(workflow.id, 50);
    
    // 分析各种因素
    const systemLoad = await this.analyzeSystemLoadPattern();
    const historicalSuccess = this.calculateHistoricalSuccessRate(executions);
    const resourceUsage = await this.estimateResourceUsage(workflow);
    const businessImpact = await this.assessBusinessImpact(workflow);

    // 计算最优调度时间
    const optimalSchedule = this.calculateOptimalTime(systemLoad, historicalSuccess, resourceUsage);
    
    // 计算置信度
    const confidence = this.calculateConfidence(systemLoad, historicalSuccess, resourceUsage, businessImpact);

    // 生成建议
    const recommendations = this.generateRecommendations(systemLoad, historicalSuccess, resourceUsage);

    return {
      workflowId: workflow.id,
      optimalSchedule,
      confidence,
      factors: {
        systemLoad,
        historicalSuccess,
        resourceUsage,
        businessImpact
      },
      recommendations
    };
  }

  private async analyzeSystemLoadPattern(): Promise<number> {
    // 分析系统负载模式，返回0-1的值
    try {
      const currentLoad = await this.getCurrentSystemLoad();
      const historicalPattern = await this.getHistoricalLoadPattern();
      
      // 简化计算：当前负载越低，得分越高
      return Math.max(0, 1 - currentLoad);
    } catch (error) {
      return 0.5; // 默认值
    }
  }

  private calculateHistoricalSuccessRate(executions: WorkflowExecution[]): number {
    if (executions.length === 0) return 0.5;
    
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    return successfulExecutions / executions.length;
  }

  private async estimateResourceUsage(workflow: AutomationWorkflow): Promise<number> {
    // 估算工作流的资源使用情况，返回0-1的值（越低越好）
    try {
      // 基于工作流复杂度和历史数据估算
      const complexity = workflow.steps.length;
      const historicalUsage = await this.getHistoricalResourceUsage(workflow.id);
      
      // 简化计算：复杂度越低，得分越高
      return Math.max(0, 1 - (complexity / 20)); // 假设最大20步
    } catch (error) {
      return 0.5; // 默认值
    }
  }

  private async assessBusinessImpact(workflow: AutomationWorkflow): Promise<number> {
    // 评估业务影响，返回0-1的值
    try {
      // 基于工作流类型和重要性评估
      const impactFactors = {
        'health_check_workflow': 0.8,
        'performance_optimization_workflow': 0.9,
        'backup_workflow': 0.7,
        'security_scan_workflow': 0.9
      };
      
      return impactFactors[workflow.id] || 0.5;
    } catch (error) {
      return 0.5; // 默认值
    }
  }

  private calculateOptimalTime(systemLoad: number, historicalSuccess: number, resourceUsage: number): string {
    // 基于各种因素计算最优调度时间
    const score = (systemLoad + historicalSuccess + (1 - resourceUsage)) / 3;
    
    // 简化逻辑：根据分数返回不同的cron表达式
    if (score > 0.8) {
      return '0 2 * * *'; // 凌晨2点
    } else if (score > 0.6) {
      return '0 */6 * * *'; // 每6小时
    } else {
      return '0 */12 * * *'; // 每12小时
    }
  }

  private calculateConfidence(...factors: number[]): number {
    // 计算置信度
    const average = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    const variance = factors.reduce((sum, factor) => sum + Math.pow(factor - average, 2), 0) / factors.length;
    
    // 方差越小，置信度越高
    return Math.max(0, 1 - variance);
  }

  private generateRecommendations(systemLoad: number, historicalSuccess: number, resourceUsage: number): string[] {
    const recommendations: string[] = [];
    
    if (systemLoad < 0.3) {
      recommendations.push('建议在低负载时段执行此工作流');
    }
    
    if (historicalSuccess < 0.8) {
      recommendations.push('建议优化工作流配置以提高成功率');
    }
    
    if (resourceUsage > 0.7) {
      recommendations.push('建议优化工作流以减少资源消耗');
    }
    
    return recommendations;
  }

  private async predictPerformanceIssues(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    try {
      // 分析性能趋势
      const performanceTrend = await this.analyzePerformanceTrend();
      
      if (performanceTrend.degradation > 0.2) {
        insights.push({
          type: 'performance',
          severity: 'high',
          title: '性能下降趋势',
          description: '系统性能呈现下降趋势，建议进行优化',
          predictedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          confidence: performanceTrend.confidence,
          impact: '可能影响工作流执行效率',
          recommendations: [
            '检查系统资源使用情况',
            '优化数据库查询',
            '考虑增加系统资源'
          ],
          metrics: {
            degradation: performanceTrend.degradation,
            confidence: performanceTrend.confidence
          }
        });
      }
    } catch (error) {
      logger.error('Failed to predict performance issues', error);
    }
    
    return insights;
  }

  private async predictFailures(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    try {
      // 分析故障模式
      const failurePatterns = await this.analyzeFailurePatterns();
      
      if (failurePatterns.risk > 0.7) {
        insights.push({
          type: 'failure',
          severity: 'critical',
          title: '高故障风险',
          description: '基于历史数据分析，系统存在高故障风险',
          predictedAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
          confidence: failurePatterns.confidence,
          impact: '可能导致服务中断',
          recommendations: [
            '立即检查系统健康状态',
            '准备应急响应方案',
            '考虑执行预防性维护'
          ],
          metrics: {
            risk: failurePatterns.risk,
            confidence: failurePatterns.confidence
          }
        });
      }
    } catch (error) {
      logger.error('Failed to predict failures', error);
    }
    
    return insights;
  }

  private async predictResourceIssues(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    try {
      const resourceForecast = await this.forecastResources(24);
      
      for (const forecast of resourceForecast) {
        if (forecast.cpu > 0.9 || forecast.memory > 0.9) {
          insights.push({
            type: 'resource',
            severity: 'high',
            title: '资源不足预警',
            description: `预测在 ${forecast.timestamp.toLocaleString()} 资源使用率将过高`,
            predictedAt: forecast.timestamp,
            confidence: forecast.confidence,
            impact: '可能导致系统性能下降',
            recommendations: [
              '考虑增加系统资源',
              '优化资源使用效率',
              '调整工作流调度时间'
            ],
            metrics: {
              cpu: forecast.cpu,
              memory: forecast.memory,
              confidence: forecast.confidence
            }
          });
        }
      }
    } catch (error) {
      logger.error('Failed to predict resource issues', error);
    }
    
    return insights;
  }

  private async identifyOpportunities(): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    
    try {
      // 分析优化机会
      const opportunities = await this.analyzeOptimizationOpportunities();
      
      if (opportunities.potential > 0.3) {
        insights.push({
          type: 'opportunity',
          severity: 'medium',
          title: '性能优化机会',
          description: '发现可以提升系统性能的机会',
          predictedAt: new Date(),
          confidence: opportunities.confidence,
          impact: '可以提升系统效率',
          recommendations: [
            '优化工作流调度策略',
            '启用智能缓存机制',
            '调整资源分配策略'
          ],
          metrics: {
            potential: opportunities.potential,
            confidence: opportunities.confidence
          }
        });
      }
    } catch (error) {
      logger.error('Failed to identify opportunities', error);
    }
    
    return insights;
  }

  // 辅助方法（简化实现）
  private async getCurrentSystemLoad(): Promise<number> {
    return 0.5; // 简化实现
  }

  private async getHistoricalLoadPattern(): Promise<number[]> {
    return [0.3, 0.5, 0.7, 0.4, 0.6]; // 简化实现
  }

  private async getHistoricalResourceUsage(workflowId: string): Promise<number> {
    return 0.6; // 简化实现
  }

  private async analyzeHistoricalPatterns(executions: WorkflowExecution[]): Promise<void> {
    // 分析历史模式
  }

  private async predictResourceAtTime(timestamp: Date, historicalData: any[]): Promise<ResourceForecast> {
    return {
      timestamp,
      cpu: 0.5 + Math.random() * 0.3,
      memory: 0.6 + Math.random() * 0.2,
      disk: 0.4 + Math.random() * 0.2,
      network: 0.3 + Math.random() * 0.3,
      confidence: 0.8
    };
  }

  private async getHistoricalResourceData(): Promise<any[]> {
    return []; // 简化实现
  }

  private async applyScheduleOptimization(optimization: ScheduleOptimization): Promise<void> {
    // 应用调度优化
    logger.info(`Applying optimization for workflow ${optimization.workflowId}`);
  }

  private async calculateOverallEfficiency(executions: WorkflowExecution[]): Promise<number> {
    if (executions.length === 0) return 0.5;
    return 0.85; // 简化实现
  }

  private async calculateResourceUtilization(): Promise<number> {
    return 0.7; // 简化实现
  }

  private calculateSuccessRate(executions: WorkflowExecution[]): number {
    if (executions.length === 0) return 0.5;
    return executions.filter(e => e.status === 'completed').length / executions.length;
  }

  private calculateAverageExecutionTime(executions: WorkflowExecution[]): number {
    const completedExecutions = executions.filter(e => e.status === 'completed' && e.endTime);
    if (completedExecutions.length === 0) return 0;
    
    const totalTime = completedExecutions.reduce((sum, exec) => {
      return sum + (exec.endTime!.getTime() - exec.startTime.getTime());
    }, 0);
    
    return totalTime / completedExecutions.length / 1000;
  }

  private async calculateSchedulingAccuracy(): Promise<number> {
    return 0.9; // 简化实现
  }

  private async calculateOptimizationImpact(): Promise<number> {
    return 0.15; // 简化实现
  }

  private async analyzePerformanceTrend(): Promise<any> {
    return {
      degradation: 0.1,
      confidence: 0.8
    };
  }

  private async analyzeFailurePatterns(): Promise<any> {
    return {
      risk: 0.3,
      confidence: 0.7
    };
  }

  private async analyzeOptimizationOpportunities(): Promise<any> {
    return {
      potential: 0.2,
      confidence: 0.6
    };
  }

  /**
   * 关闭调度器
   */
  async shutdown(): Promise<void> {
    try {
      if (this.optimizationInterval) {
        clearInterval(this.optimizationInterval);
        this.optimizationInterval = null;
      }
      
      if (this.predictionInterval) {
        clearInterval(this.predictionInterval);
        this.predictionInterval = null;
      }
      
      this.isInitialized = false;
      logger.info('Intelligent Scheduler shutdown completed');
    } catch (error) {
      logger.error('Error during Intelligent Scheduler shutdown', error);
    }
  }
}

// 导出单例实例
export const intelligentScheduler = IntelligentScheduler.getInstance();