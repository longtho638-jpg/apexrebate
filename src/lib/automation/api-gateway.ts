/**
 * 跨平台集成和API网关系统
 * 统一管理外部API集成、第三方服务连接、数据同步等
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import ZAI from 'z-ai-web-dev-sdk';

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  targetService: string;
  targetUrl: string;
  authentication: AuthenticationConfig;
  rateLimit: RateLimitConfig;
  caching: CacheConfig;
  transformation: TransformationConfig;
  enabled: boolean;
  version: string;
  documentation?: string;
}

export interface AuthenticationConfig {
  type: 'none' | 'api_key' | 'oauth2' | 'jwt' | 'basic';
  credentials: any;
  headerName?: string;
  queryParam?: string;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  window: number; // seconds
  strategy: 'fixed' | 'sliding';
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // seconds
  strategy: 'memory' | 'redis';
  keyGenerator?: string;
}

export interface TransformationConfig {
  request: TransformRule[];
  response: TransformRule[];
}

export interface TransformRule {
  type: 'add' | 'remove' | 'modify' | 'rename';
  path: string;
  value?: any;
  condition?: string;
}

export interface ExternalService {
  id: string;
  name: string;
  type: 'exchange' | 'payment' | 'analytics' | 'notification' | 'crm' | 'custom';
  baseUrl: string;
  authentication: AuthenticationConfig;
  healthCheck: HealthCheckConfig;
  retryPolicy: RetryPolicy;
  timeout: number;
  enabled: boolean;
  metadata: any;
}

export interface HealthCheckConfig {
  enabled: boolean;
  endpoint: string;
  interval: number; // seconds
  timeout: number;
  expectedStatus: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

export class APIGateway {
  private static instance: APIGateway;
  private zai: any = null;
  private endpoints: Map<string, APIEndpoint> = new Map();
  private services: Map<string, ExternalService> = new Map();
  private rateLimiters: Map<string, any> = new Map();
  private circuitBreakers: Map<string, any> = new Map();
  private requestLogs: any[] = [];

  static getInstance(): APIGateway {
    if (!APIGateway.instance) {
      APIGateway.instance = new APIGateway();
    }
    return APIGateway.instance;
  }

  constructor() {
    this.initializeServices();
    this.loadEndpoints();
    this.loadExternalServices();
    this.startHealthChecks();
    this.startMetricsCollection();
  }

  /**
   * 处理API网关请求
   */
  async handleRequest(request: NextRequest, context: any): Promise<NextResponse> {
    try {
      const startTime = Date.now();
      const { pathname, searchParams } = new URL(request.url);
      
      // 查找匹配的端点
      const endpoint = this.findMatchingEndpoint(request.method, pathname);
      
      if (!endpoint) {
        return NextResponse.json(
          { error: 'Endpoint not found' },
          { status: 404 }
        );
      }

      // 检查端点是否启用
      if (!endpoint.enabled) {
        return NextResponse.json(
          { error: 'Endpoint disabled' },
          { status: 503 }
        );
      }

      // 速率限制检查
      const rateLimitResult = await this.checkRateLimit(endpoint, request);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.reset.toString()
            }
          }
        );
      }

      // 认证检查
      const authResult = await this.authenticateRequest(endpoint, request);
      if (!authResult.valid) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }

      // 缓存检查
      if (endpoint.caching.enabled && request.method === 'GET') {
        const cachedResponse = await this.getCachedResponse(endpoint, request);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // 熔断器检查
      const circuitBreaker = this.getCircuitBreaker(endpoint.targetService);
      if (circuitBreaker.isOpen()) {
        return NextResponse.json(
          { error: 'Service unavailable' },
          { status: 503 }
        );
      }

      // 获取目标服务
      const service = this.services.get(endpoint.targetService);
      if (!service || !service.enabled) {
        return NextResponse.json(
          { error: 'Target service unavailable' },
          { status: 503 }
        );
      }

      // 转换请求
      const transformedRequest = await this.transformRequest(
        request, 
        endpoint.transformation.request
      );

      // 发送请求到目标服务
      const response = await this.sendRequestToService(
        service,
        endpoint,
        transformedRequest
      );

      // 转换响应
      const transformedResponse = await this.transformResponse(
        response,
        endpoint.transformation.response
      );

      // 缓存响应
      if (endpoint.caching.enabled && request.method === 'GET') {
        await this.cacheResponse(endpoint, request, transformedResponse);
      }

      // 记录请求日志
      const duration = Date.now() - startTime;
      await this.logRequest({
        endpoint: endpoint.id,
        method: request.method,
        path: pathname,
        statusCode: transformedResponse.status,
        duration,
        userId: authResult.userId,
        service: endpoint.targetService
      });

      // 更新熔断器状态
      circuitBreaker.recordSuccess();

      return transformedResponse;

    } catch (error) {
      logger.error('API Gateway request failed', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  /**
   * 注册新的API端点
   */
  async registerEndpoint(endpoint: Omit<APIEndpoint, 'id'>): Promise<string> {
    try {
      const id = this.generateEndpointId();
      const fullEndpoint: APIEndpoint = {
        ...endpoint,
        id
      };

      this.endpoints.set(id, fullEndpoint);
      
      // 保存到数据库
      await this.saveEndpointToDatabase(fullEndpoint);
      
      // 清除相关缓存
      await this.clearEndpointCache();

      logger.info(`API endpoint registered: ${id}`, {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method
      });

      return id;

    } catch (error) {
      logger.error('Failed to register endpoint', error);
      throw error;
    }
  }

  /**
   * 注册外部服务
   */
  async registerExternalService(service: Omit<ExternalService, 'id'>): Promise<string> {
    try {
      const id = this.generateServiceId();
      const fullService: ExternalService = {
        ...service,
        id
      };

      this.services.set(id, fullService);
      
      // 保存到数据库
      await this.saveServiceToDatabase(fullService);
      
      // 初始化熔断器
      this.initializeCircuitBreaker(id);
      
      // 启动健康检查
      if (service.healthCheck.enabled) {
        this.startServiceHealthCheck(id);
      }

      logger.info(`External service registered: ${id}`, {
        name: service.name,
        type: service.type,
        baseUrl: service.baseUrl
      });

      return id;

    } catch (error) {
      logger.error('Failed to register external service', error);
      throw error;
    }
  }

  /**
   * 数据同步
   */
  async syncData(sourceService: string, targetService: string, config: any): Promise<any> {
    try {
      const source = this.services.get(sourceService);
      const target = this.services.get(targetService);
      
      if (!source || !target) {
        throw new Error('Service not found');
      }

      // 使用AI优化同步策略
      const syncStrategy = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `你是一个数据集成专家，专门设计数据同步策略。
            基于源服务和目标服务的配置，设计最优的数据同步方案。
            
            请返回JSON格式的同步策略：
            {
              "strategy": "full|incremental|real_time",
              "frequency": "同步频率",
              "batchSize": 批次大小,
              "transformations": ["转换1", "转换2"],
              "conflictResolution": "解决冲突策略",
              "monitoring": ["监控指标1", "监控指标2"]
            }`
          },
          {
            role: 'user',
            content: `源服务配置：
            ${JSON.stringify(source, null, 2)}
            
            目标服务配置：
            ${JSON.stringify(target, null, 2)}
            
            同步配置：
            ${JSON.stringify(config, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const strategy = JSON.parse(syncStrategy.choices[0].message.content);
      
      // 执行数据同步
      const syncResult = await this.executeDataSync(source, target, strategy, config);
      
      logger.info(`Data sync completed: ${sourceService} -> ${targetService}`, {
        strategy: strategy.strategy,
        recordsProcessed: syncResult.recordsProcessed
      });

      return {
        syncId: this.generateSyncId(),
        sourceService,
        targetService,
        strategy,
        result: syncResult,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Data sync failed', error);
      throw error;
    }
  }

  /**
   * 获取API网关统计
   */
  async getGatewayStats(timeRange: string = '1h'): Promise<any> {
    try {
      const cacheKey = `gateway_stats_${timeRange}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const now = new Date();
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = new Date(now.getTime() - timeRangeMs);
      
      // 过滤请求日志
      const recentLogs = this.requestLogs.filter(log => 
        log.timestamp >= startTime
      );

      const stats = {
        timeRange,
        timestamp: now,
        totalRequests: recentLogs.length,
        successfulRequests: recentLogs.filter(log => log.statusCode < 400).length,
        errorRequests: recentLogs.filter(log => log.statusCode >= 400).length,
        averageResponseTime: this.calculateAverageResponseTime(recentLogs),
        topEndpoints: this.getTopEndpoints(recentLogs),
        topServices: this.getTopServices(recentLogs),
        statusCodes: this.getStatusCodeDistribution(recentLogs),
        users: this.getUniqueUsersCount(recentLogs),
        errors: this.getTopErrors(recentLogs)
      };

      // 缓存统计结果
      await redis.setex(cacheKey, 300, JSON.stringify(stats));
      
      return stats;

    } catch (error) {
      logger.error('Failed to get gateway stats', error);
      throw error;
    }
  }

  /**
   * 获取服务健康状态
   */
  async getServicesHealth(): Promise<any> {
    try {
      const healthStatus = {};
      
      for (const [serviceId, service] of this.services.entries()) {
        const circuitBreaker = this.getCircuitBreaker(serviceId);
        const healthCheck = await this.getServiceHealthCheck(serviceId);
        
        healthStatus[serviceId] = {
          name: service.name,
          type: service.type,
          enabled: service.enabled,
          healthy: circuitBreaker.isHealthy() && healthCheck.healthy,
          circuitBreaker: {
            state: circuitBreaker.getState(),
            failures: circuitBreaker.getFailureCount()
          },
          healthCheck,
          lastCheck: new Date()
        };
      }

      return {
        timestamp: new Date(),
        services: healthStatus,
        overallHealth: this.calculateOverallHealth(healthStatus)
      };

    } catch (error) {
      logger.error('Failed to get services health', error);
      throw error;
    }
  }

  /**
   * 私有方法实现
   */
  private async initializeServices(): Promise<void> {
    try {
      this.zai = await ZAI.create();
      logger.info('API Gateway AI services initialized');
    } catch (error) {
      logger.error('Failed to initialize API Gateway AI services', error);
    }
  }

  private loadEndpoints(): void {
    // 加载预定义的端点
    const defaultEndpoints: APIEndpoint[] = [
      {
        id: 'ep_001',
        name: 'User Profile API',
        method: 'GET',
        path: '/api/user/profile',
        targetService: 'user_service',
        targetUrl: '/profile',
        authentication: { type: 'jwt', credentials: {} },
        rateLimit: { enabled: true, requests: 100, window: 60, strategy: 'sliding' },
        caching: { enabled: true, ttl: 300, strategy: 'redis' },
        transformation: { request: [], response: [] },
        enabled: true,
        version: 'v1'
      },
      {
        id: 'ep_002',
        name: 'Trading History API',
        method: 'GET',
        path: '/api/trading/history',
        targetService: 'trading_service',
        targetUrl: '/history',
        authentication: { type: 'jwt', credentials: {} },
        rateLimit: { enabled: true, requests: 50, window: 60, strategy: 'sliding' },
        caching: { enabled: true, ttl: 180, strategy: 'redis' },
        transformation: { request: [], response: [] },
        enabled: true,
        version: 'v1'
      }
    ];

    for (const endpoint of defaultEndpoints) {
      this.endpoints.set(endpoint.id, endpoint);
    }

    logger.info(`API endpoints loaded: ${this.endpoints.size}`);
  }

  private loadExternalServices(): void {
    // 加载预定义的外部服务
    const defaultServices: ExternalService[] = [
      {
        id: 'svc_001',
        name: 'User Service',
        type: 'custom',
        baseUrl: 'http://localhost:3001',
        authentication: { type: 'none', credentials: {} },
        healthCheck: {
          enabled: true,
          endpoint: '/health',
          interval: 30,
          timeout: 5,
          expectedStatus: 200,
          healthyThreshold: 2,
          unhealthyThreshold: 3
        },
        retryPolicy: {
          enabled: true,
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
        },
        timeout: 10000,
        enabled: true,
        metadata: {}
      },
      {
        id: 'svc_002',
        name: 'Trading Service',
        type: 'custom',
        baseUrl: 'http://localhost:3002',
        authentication: { type: 'api_key', credentials: { apiKey: 'secret_key' } },
        healthCheck: {
          enabled: true,
          endpoint: '/health',
          interval: 30,
          timeout: 5,
          expectedStatus: 200,
          healthyThreshold: 2,
          unhealthyThreshold: 3
        },
        retryPolicy: {
          enabled: true,
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 10000,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
        },
        timeout: 15000,
        enabled: true,
        metadata: {}
      }
    ];

    for (const service of defaultServices) {
      this.services.set(service.id, service);
      this.initializeCircuitBreaker(service.id);
    }

    logger.info(`External services loaded: ${this.services.size}`);
  }

  private findMatchingEndpoint(method: string, path: string): APIEndpoint | null {
    for (const endpoint of this.endpoints.values()) {
      if (endpoint.method === method && this.matchPath(endpoint.path, path)) {
        return endpoint;
      }
    }
    return null;
  }

  private matchPath(endpointPath: string, requestPath: string): boolean {
    // 简单的路径匹配，支持参数
    const endpointParts = endpointPath.split('/');
    const requestParts = requestPath.split('/');
    
    if (endpointParts.length !== requestParts.length) {
      return false;
    }
    
    for (let i = 0; i < endpointParts.length; i++) {
      if (endpointParts[i].startsWith(':')) {
        continue; // 参数匹配
      }
      if (endpointParts[i] !== requestParts[i]) {
        return false;
      }
    }
    
    return true;
  }

  private async checkRateLimit(endpoint: APIEndpoint, request: NextRequest): Promise<any> {
    if (!endpoint.rateLimit.enabled) {
      return { allowed: true, limit: 0, remaining: 0, reset: 0 };
    }

    const clientId = this.getClientId(request);
    const key = `rate_limit_${endpoint.id}_${clientId}`;
    
    // 简化的速率限制实现
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, endpoint.rateLimit.window);
    }
    
    const allowed = current <= endpoint.rateLimit.requests;
    
    return {
      allowed,
      limit: endpoint.rateLimit.requests,
      remaining: Math.max(0, endpoint.rateLimit.requests - current),
      reset: Date.now() + endpoint.rateLimit.window * 1000
    };
  }

  private async authenticateRequest(endpoint: APIEndpoint, request: NextRequest): Promise<any> {
    if (endpoint.authentication.type === 'none') {
      return { valid: true };
    }

    // 简化的JWT认证
    if (endpoint.authentication.type === 'jwt') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false };
      }
      
      const token = authHeader.substring(7);
      // 这里应该验证JWT token
      return { valid: true, userId: 'user123' }; // 模拟
    }

    return { valid: false };
  }

  private async getCachedResponse(endpoint: APIEndpoint, request: NextRequest): Promise<NextResponse | null> {
    const cacheKey = this.generateCacheKey(endpoint, request);
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      const response = JSON.parse(cached);
      return NextResponse.json(response.body, {
        status: response.status,
        headers: response.headers
      });
    }
    
    return null;
  }

  private async cacheResponse(endpoint: APIEndpoint, request: NextRequest, response: NextResponse): Promise<void> {
    const cacheKey = this.generateCacheKey(endpoint, request);
    const responseData = {
      body: await response.json(),
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
    
    await redis.setex(cacheKey, endpoint.caching.ttl, JSON.stringify(responseData));
  }

  private getCircuitBreaker(serviceId: string): any {
    if (!this.circuitBreakers.has(serviceId)) {
      this.initializeCircuitBreaker(serviceId);
    }
    return this.circuitBreakers.get(serviceId);
  }

  private initializeCircuitBreaker(serviceId: string): void {
    // 简化的熔断器实现
    const circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed', // closed, open, half-open
      threshold: 5,
      timeout: 60000, // 1 minute
      
      isOpen() {
        return this.state === 'open' && 
               Date.now() - this.lastFailureTime > this.timeout;
      },
      
      isHealthy() {
        return this.state === 'closed' || 
               (this.state === 'open' && this.isOpen());
      },
      
      recordSuccess() {
        this.failures = 0;
        this.state = 'closed';
      },
      
      recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        
        if (this.failures >= this.threshold) {
          this.state = 'open';
        }
      },
      
      getState() {
        return this.state;
      },
      
      getFailureCount() {
        return this.failures;
      }
    };
    
    this.circuitBreakers.set(serviceId, circuitBreaker);
  }

  private async transformRequest(request: NextRequest, rules: TransformRule[]): Promise<any> {
    // 简化的请求转换
    return {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text()
    };
  }

  private async transformResponse(response: NextResponse, rules: TransformRule[]): Promise<NextResponse> {
    // 简化的响应转换
    return response;
  }

  private async sendRequestToService(
    service: ExternalService,
    endpoint: APIEndpoint,
    transformedRequest: any
  ): Promise<NextResponse> {
    const circuitBreaker = this.getCircuitBreaker(service.id);
    
    try {
      const url = `${service.baseUrl}${endpoint.targetUrl}`;
      
      // 模拟HTTP请求
      const response = await fetch(url, {
        method: transformedRequest.method,
        headers: transformedRequest.headers,
        body: transformedRequest.body
      });
      
      const data = await response.json();
      
      circuitBreaker.recordSuccess();
      
      return NextResponse.json(data, { status: response.status });
      
    } catch (error) {
      circuitBreaker.recordFailure();
      throw error;
    }
  }

  private async executeDataSync(
    source: ExternalService,
    target: ExternalService,
    strategy: any,
    config: any
  ): Promise<any> {
    // 模拟数据同步
    return {
      strategy: strategy.strategy,
      recordsProcessed: Math.floor(Math.random() * 1000) + 100,
      duration: Math.floor(Math.random() * 60000) + 10000,
      errors: 0,
      warnings: Math.floor(Math.random() * 5)
    };
  }

  private startHealthChecks(): void {
    // 定期健康检查
    setInterval(async () => {
      for (const [serviceId, service] of this.services.entries()) {
        if (service.healthCheck.enabled) {
          await this.performHealthCheck(serviceId);
        }
      }
    }, 30000); // 每30秒检查一次
  }

  private startMetricsCollection(): void {
    // 定期收集指标
    setInterval(async () => {
      await this.collectMetrics();
    }, 60000); // 每分钟收集一次
  }

  private async performHealthCheck(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service || !service.healthCheck.enabled) return;

    try {
      const url = `${service.baseUrl}${service.healthCheck.endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(service.healthCheck.timeout * 1000)
      });

      const healthy = response.status === service.healthCheck.expectedStatus;
      
      await this.updateServiceHealth(serviceId, healthy);
      
    } catch (error) {
      await this.updateServiceHealth(serviceId, false);
      logger.warn(`Health check failed for service: ${serviceId}`, error);
    }
  }

  private async updateServiceHealth(serviceId: string, healthy: boolean): Promise<void> {
    const key = `service_health_${serviceId}`;
    const healthData = {
      healthy,
      lastCheck: new Date(),
      serviceId
    };
    
    await redis.setex(key, 300, JSON.stringify(healthData));
  }

  private async getServiceHealthCheck(serviceId: string): Promise<any> {
    const key = `service_health_${serviceId}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return { healthy: false, lastCheck: new Date() };
  }

  private startServiceHealthCheck(serviceId: string): void {
    // 健康检查已在startHealthChecks中统一处理
  }

  private async logRequest(logData: any): Promise<void> {
    logData.timestamp = new Date();
    this.requestLogs.push(logData);
    
    // 保持最近10000条日志
    if (this.requestLogs.length > 10000) {
      this.requestLogs = this.requestLogs.slice(-10000);
    }
    
    // 异步保存到数据库
    await redis.lpush('gateway_logs', JSON.stringify(logData));
    await redis.expire('gateway_logs', 86400 * 7); // 保留7天
  }

  private calculateAverageResponseTime(logs: any[]): number {
    if (logs.length === 0) return 0;
    const total = logs.reduce((sum, log) => sum + log.duration, 0);
    return Math.round(total / logs.length);
  }

  private getTopEndpoints(logs: any[]): any[] {
    const counts = {};
    logs.forEach(log => {
      counts[log.endpoint] = (counts[log.endpoint] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  private getTopServices(logs: any[]): any[] {
    const counts = {};
    logs.forEach(log => {
      counts[log.service] = (counts[log.service] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([service, count]) => ({ service, count }));
  }

  private getStatusCodeDistribution(logs: any[]): Record<string, number> {
    const distribution = {};
    logs.forEach(log => {
      const status = Math.floor(log.statusCode / 100) * 100;
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  }

  private getUniqueUsersCount(logs: any[]): number {
    const users = new Set();
    logs.forEach(log => {
      if (log.userId) users.add(log.userId);
    });
    return users.size;
  }

  private getTopErrors(logs: any[]): any[] {
    const errors = logs.filter(log => log.statusCode >= 400);
    const counts = {};
    errors.forEach(log => {
      counts[log.endpoint] = (counts[log.endpoint] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  private calculateOverallHealth(healthStatus: any): string {
    const services = Object.values(healthStatus);
    const healthyCount = services.filter((s: any) => s.healthy).length;
    const totalCount = services.length;
    
    if (healthyCount === totalCount) return 'healthy';
    if (healthyCount > totalCount / 2) return 'degraded';
    return 'unhealthy';
  }

  private parseTimeRange(timeRange: string): number {
    const unit = timeRange.slice(-1);
    const value = parseInt(timeRange.slice(0, -1));
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // 默认1小时
    }
  }

  private getClientId(request: NextRequest): string {
    // 从请求中提取客户端ID
    return request.ip || 'unknown';
  }

  private generateCacheKey(endpoint: APIEndpoint, request: NextRequest): string {
    const url = new URL(request.url);
    return `cache_${endpoint.id}_${url.pathname}${url.search}`;
  }

  private async collectMetrics(): Promise<void> {
    // 收集系统指标
    const metrics = {
      timestamp: new Date(),
      activeEndpoints: Array.from(this.endpoints.values()).filter(e => e.enabled).length,
      activeServices: Array.from(this.services.values()).filter(s => s.enabled).length,
      totalRequests: this.requestLogs.length,
      circuitBreakersOpen: Array.from(this.circuitBreakers.values()).filter(cb => cb.isOpen()).length
    };
    
    await redis.lpush('gateway_metrics', JSON.stringify(metrics));
    await redis.expire('gateway_metrics', 86400 * 7); // 保留7天
  }

  // 数据库操作方法
  private async saveEndpointToDatabase(endpoint: APIEndpoint): Promise<void> {
    await redis.lpush('gateway_endpoints', JSON.stringify(endpoint));
    await redis.expire('gateway_endpoints', 86400 * 30); // 保留30天
  }

  private async saveServiceToDatabase(service: ExternalService): Promise<void> {
    await redis.lpush('gateway_services', JSON.stringify(service));
    await redis.expire('gateway_services', 86400 * 30); // 保留30天
  }

  private async clearEndpointCache(): Promise<void> {
    const keys = await redis.keys('gateway_stats_*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // ID生成方法
  private generateEndpointId(): string {
    return `ep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateServiceId(): string {
    return `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const apiGateway = APIGateway.getInstance();