/**
 * 负载均衡器 - 处理多区域负载均衡和故障转移
 */

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'weighted' | 'least-connections' | 'response-time' | 'geographic'
  healthCheck: {
    enabled: boolean
    interval: number // seconds
    timeout: number // seconds
    retries: number
    path: string
    expectedStatus: number[]
  }
  failover: {
    enabled: boolean
    threshold: number // consecutive failures
    recoveryTime: number // seconds
    stickySessions: boolean
  }
  weights: Record<string, number>
  regions: string[]
}

export interface BackendServer {
  id: string
  regionId: string
  host: string
  port: number
  protocol: 'http' | 'https'
  weight: number
  connections: number
  status: 'healthy' | 'unhealthy' | 'draining'
  responseTime: number
  lastHealthCheck: Date
  failureCount: number
  metadata: Record<string, any>
}

export interface HealthCheckResult {
  serverId: string
  status: 'healthy' | 'unhealthy'
  responseTime: number
  error?: string
  timestamp: Date
}

export interface LoadBalancingMetrics {
  totalRequests: number
  requestsPerSecond: number
  activeConnections: number
  averageResponseTime: number
  errorRate: number
  serverMetrics: Array<{
    serverId: string
    requests: number
    connections: number
    responseTime: number
    errorRate: number
  }>
}

export interface SessionAffinity {
  enabled: boolean
  cookieName: string
  duration: number // seconds
  fallback: 'round-robin' | 'least-connections'
}

export class LoadBalancer {
  private config: LoadBalancerConfig
  private servers: Map<string, BackendServer> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null
  private metrics: LoadBalancingMetrics
  private sessionAffinity: SessionAffinity
  private requestCounter: number = 0

  constructor(config: LoadBalancerConfig) {
    this.config = config
    this.metrics = this.initializeMetrics()
    this.sessionAffinity = {
      enabled: config.failover.stickySessions,
      cookieName: 'APX_LB_SESSION',
      duration: 3600,
      fallback: 'round-robin'
    }
  }

  private initializeMetrics(): LoadBalancingMetrics {
    return {
      totalRequests: 0,
      requestsPerSecond: 0,
      activeConnections: 0,
      averageResponseTime: 0,
      errorRate: 0,
      serverMetrics: []
    }
  }

  // 添加后端服务器
  addServer(server: BackendServer): void {
    this.servers.set(server.id, server)
    this.updateServerMetrics()
  }

  // 移除后端服务器
  removeServer(serverId: string): boolean {
    const deleted = this.servers.delete(serverId)
    if (deleted) {
      this.updateServerMetrics()
    }
    return deleted
  }

  // 获取所有服务器
  getServers(): BackendServer[] {
    return Array.from(this.servers.values())
  }

  // 获取健康服务器
  getHealthyServers(): BackendServer[] {
    return this.getServers().filter(server => server.status === 'healthy')
  }

  // 选择服务器
  selectServer(sessionId?: string): BackendServer | null {
    const healthyServers = this.getHealthyServers()
    
    if (healthyServers.length === 0) {
      return null
    }

    // 如果启用了会话亲和性
    if (this.sessionAffinity.enabled && sessionId) {
      const stickyServer = this.getStickyServer(sessionId)
      if (stickyServer && stickyServer.status === 'healthy') {
        return stickyServer
      }
    }

    // 根据策略选择服务器
    return this.selectServerByStrategy(healthyServers)
  }

  private selectServerByStrategy(servers: BackendServer[]): BackendServer {
    const strategy = this.config.strategy

    switch (strategy) {
      case 'weighted':
        return this.selectByWeight(servers)
      case 'least-connections':
        return this.selectByLeastConnections(servers)
      case 'response-time':
        return this.selectByResponseTime(servers)
      case 'geographic':
        return this.selectByGeography(servers)
      case 'round-robin':
      default:
        return this.selectRoundRobin(servers)
    }
  }

  private selectRoundRobin(servers: BackendServer[]): BackendServer {
    const index = this.requestCounter % servers.length
    this.requestCounter++
    return servers[index]
  }

  private selectByWeight(servers: BackendServer[]): BackendServer {
    const totalWeight = servers.reduce((sum, server) => sum + server.weight, 0)
    let random = Math.random() * totalWeight

    for (const server of servers) {
      random -= server.weight
      if (random <= 0) {
        return server
      }
    }

    return servers[0]
  }

  private selectByLeastConnections(servers: BackendServer[]): BackendServer {
    return servers.reduce((min, server) => 
      server.connections < min.connections ? server : min
    )
  }

  private selectByResponseTime(servers: BackendServer[]): BackendServer {
    return servers.reduce((fastest, server) => 
      server.responseTime < fastest.responseTime ? server : fastest
    )
  }

  private selectByGeography(servers: BackendServer[]): BackendServer {
    // 简化的地理选择，实际应用中需要根据用户位置
    return servers[0]
  }

  private getStickyServer(sessionId: string): BackendServer | null {
    // 从会话存储中获取粘性服务器
    // 这里简化实现，实际应用中需要Redis或其他存储
    return null
  }

  // 处理请求
  async handleRequest(request: {
    method: string
    path: string
    headers: Record<string, string>
    body?: any
    sessionId?: string
  }): Promise<{
    server: BackendServer
    response: any
    responseTime: number
  }> {
    const startTime = Date.now()
    
    // 选择服务器
    const server = this.selectServer(request.sessionId)
    if (!server) {
      throw new Error('没有可用的健康服务器')
    }

    // 增加连接数
    server.connections++
    this.metrics.activeConnections++

    try {
      // 转发请求到选中的服务器
      const response = await this.forwardRequest(server, request)
      const responseTime = Date.now() - startTime

      // 更新指标
      this.updateMetrics(server, responseTime, false)

      return {
        server,
        response,
        responseTime
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      // 更新错误指标
      this.updateMetrics(server, responseTime, true)
      
      // 增加失败计数
      server.failureCount++
      
      // 检查是否需要标记为不健康
      if (server.failureCount >= this.config.failover.threshold) {
        server.status = 'unhealthy'
      }

      throw error
    } finally {
      // 减少连接数
      server.connections--
      this.metrics.activeConnections--
    }
  }

  private async forwardRequest(server: BackendServer, request: {
    method: string
    path: string
    headers: Record<string, string>
    body?: any
  }): Promise<any> {
    const url = `${server.protocol}://${server.host}:${server.port}${request.path}`
    
    const response = await fetch(url, {
      method: request.method,
      headers: {
        ...request.headers,
        'X-Forwarded-For': request.headers['x-forwarded-for'] || '',
        'X-Real-IP': request.headers['x-real-ip'] || '',
        'X-Forwarded-Proto': request.headers['x-forwarded-proto'] || 'https'
      },
      body: request.body ? JSON.stringify(request.body) : undefined
    })

    if (!response.ok) {
      throw new Error(`服务器响应错误: ${response.status}`)
    }

    return response.json()
  }

  // 更新指标
  private updateMetrics(server: BackendServer, responseTime: number, isError: boolean): void {
    // 更新全局指标
    this.metrics.totalRequests++
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests

    if (isError) {
      this.metrics.errorRate = 
        (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 1) / 
        this.metrics.totalRequests
    } else {
      this.metrics.errorRate = 
        (this.metrics.errorRate * (this.metrics.totalRequests - 1)) / 
        this.metrics.totalRequests
    }

    // 更新服务器指标
    server.responseTime = responseTime

    let serverMetric = this.metrics.serverMetrics.find(m => m.serverId === server.id)
    if (!serverMetric) {
      serverMetric = {
        serverId: server.id,
        requests: 0,
        connections: 0,
        responseTime: 0,
        errorRate: 0
      }
      this.metrics.serverMetrics.push(serverMetric)
    }

    serverMetric.requests++
    serverMetric.responseTime = 
      (serverMetric.responseTime * (serverMetric.requests - 1) + responseTime) / 
      serverMetric.requests

    if (isError) {
      serverMetric.errorRate = 
        (serverMetric.errorRate * (serverMetric.requests - 1) + 1) / 
        serverMetric.requests
    } else {
      serverMetric.errorRate = 
        (serverMetric.errorRate * (serverMetric.requests - 1)) / 
        serverMetric.requests
    }
  }

  private updateServerMetrics(): void {
    this.metrics.serverMetrics = this.getServers().map(server => ({
      serverId: server.id,
      requests: 0,
      connections: server.connections,
      responseTime: server.responseTime,
      errorRate: 0
    }))
  }

  // 启动健康检查
  startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, this.config.healthCheck.interval * 1000)

    console.log('负载均衡器健康检查已启动')
  }

  // 停止健康检查
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('负载均衡器健康检查已停止')
    }
  }

  // 执行健康检查
  private async performHealthChecks(): Promise<void> {
    const promises = this.getServers().map(server => this.checkServerHealth(server))
    const results = await Promise.allSettled(promises)

    results.forEach((result, index) => {
      const server = this.getServers()[index]
      if (result.status === 'fulfilled') {
        this.handleHealthCheckResult(server, result.value)
      } else {
        this.handleHealthCheckResult(server, {
          serverId: server.id,
          status: 'unhealthy',
          responseTime: 0,
          error: result.reason?.message || '未知错误',
          timestamp: new Date()
        })
      }
    })
  }

  // 检查单个服务器健康状态
  private async checkServerHealth(server: BackendServer): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const url = `${server.protocol}://${server.host}:${server.port}${this.config.healthCheck.path}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.healthCheck.timeout * 1000)
      })

      const responseTime = Date.now() - startTime
      const isHealthy = this.config.healthCheck.expectedStatus.includes(response.status)

      return {
        serverId: server.id,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        serverId: server.id,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date()
      }
    }
  }

  // 处理健康检查结果
  private handleHealthCheckResult(server: BackendServer, result: HealthCheckResult): void {
    server.lastHealthCheck = result.timestamp
    server.responseTime = result.responseTime

    if (result.status === 'healthy') {
      if (server.status === 'unhealthy') {
        // 服务器恢复健康
        server.status = 'healthy'
        server.failureCount = 0
        console.log(`服务器 ${server.id} 已恢复健康状态`)
      }
    } else {
      server.failureCount++
      
      if (server.failureCount >= this.config.failover.threshold) {
        server.status = 'unhealthy'
        console.log(`服务器 ${server.id} 标记为不健康，失败次数: ${server.failureCount}`)
      }
    }
  }

  // 获取负载均衡指标
  getMetrics(): LoadBalancingMetrics {
    // 计算每秒请求数
    this.metrics.requestsPerSecond = this.metrics.totalRequests / (Date.now() / 1000)
    
    return { ...this.metrics }
  }

  // 更新配置
  updateConfig(updates: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...updates }
    
    // 更新会话亲和性配置
    if (updates.failover?.stickySessions !== undefined) {
      this.sessionAffinity.enabled = updates.failover.stickySessions
    }
  }

  // 获取配置
  getConfig(): LoadBalancerConfig {
    return this.config
  }

  // 启用/禁用服务器
  enableServer(serverId: string): boolean {
    const server = this.servers.get(serverId)
    if (server) {
      server.status = 'healthy'
      server.failureCount = 0
      return true
    }
    return false
  }

  disableServer(serverId: string): boolean {
    const server = this.servers.get(serverId)
    if (server) {
      server.status = 'draining'
      return true
    }
    return false
  }

  // 设置服务器权重
  setServerWeight(serverId: string, weight: number): boolean {
    const server = this.servers.get(serverId)
    if (server) {
      server.weight = weight
      this.config.weights[serverId] = weight
      return true
    }
    return false
  }

  // 获取服务器统计
  getServerStats(): Array<{
    id: string
    regionId: string
    host: string
    port: number
    status: string
    connections: number
    responseTime: number
    failureCount: number
    requests: number
    errorRate: number
  }> {
    return this.getServers().map(server => {
      const metric = this.metrics.serverMetrics.find(m => m.serverId === server.id)
      return {
        id: server.id,
        regionId: server.regionId,
        host: server.host,
        port: server.port,
        status: server.status,
        connections: server.connections,
        responseTime: server.responseTime,
        failureCount: server.failureCount,
        requests: metric?.requests || 0,
        errorRate: metric?.errorRate || 0
      }
    })
  }

  // 重置指标
  resetMetrics(): void {
    this.metrics = this.initializeMetrics()
    this.requestCounter = 0
  }
}