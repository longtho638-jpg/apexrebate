/**
 * 区域管理器 - 处理多区域部署和地理路由
 */

export interface Region {
  id: string
  name: string
  code: string // ISO 3166-1 alpha-2
  location: {
    city: string
    country: string
    continent: string
    latitude: number
    longitude: number
  }
  infrastructure: {
    apiEndpoint: string
    cdnEndpoint: string
    databaseUrl: string
    redisUrl: string
    storageBucket: string
  }
  capacity: {
    maxUsers: number
    currentUsers: number
    cpuThreshold: number
    memoryThreshold: number
  }
  status: 'active' | 'maintenance' | 'offline'
  latency: {
    average: number // ms
    p95: number // ms
    p99: number // ms
  }
  features: string[]
  createdAt: Date
  updatedAt: Date
}

export interface GeoLocation {
  country: string
  region: string
  city: string
  latitude: number
  longitude: number
  isp: string
  timezone: string
}

export interface DeploymentConfig {
  regions: Region[]
  loadBalancing: {
    strategy: 'round-robin' | 'weighted' | 'geographic' | 'least-connections'
    weights: Record<string, number>
    healthCheckInterval: number
    failoverThreshold: number
  }
  cdn: {
    provider: 'cloudflare' | 'aws-cloudfront' | 'fastly' | 'akamai'
    distributionId: string
    cacheRules: CacheRule[]
  }
  security: {
    wafEnabled: boolean
    ddosProtection: boolean
    sslCertificate: string
    firewallRules: FirewallRule[]
  }
  monitoring: {
    metricsEnabled: boolean
    loggingEnabled: boolean
    alertingEnabled: boolean
    retentionDays: number
  }
}

export interface CacheRule {
  path: string
  ttl: number
  cacheKey: string
  compress: boolean
  headers: string[]
}

export interface FirewallRule {
  name: string
  action: 'allow' | 'deny' | 'rate_limit'
  conditions: Record<string, any>
  priority: number
}

export interface HealthCheck {
  regionId: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  errorRate: number
  lastCheck: Date
  metrics: {
    cpu: number
    memory: number
    disk: number
    network: number
  }
}

export class RegionManager {
  private regions: Map<string, Region> = new Map()
  private config: DeploymentConfig
  private healthChecks: Map<string, HealthCheck> = new Map()
  private routingTable: Map<string, string[]> = new Map() // country -> regionIds

  constructor(config: DeploymentConfig) {
    this.config = config
    this.initializeRegions()
    this.buildRoutingTable()
  }

  private initializeRegions(): void {
    this.config.regions.forEach(region => {
      this.regions.set(region.id, region)
      this.healthChecks.set(region.id, {
        regionId: region.id,
        status: 'healthy',
        responseTime: 0,
        errorRate: 0,
        lastCheck: new Date(),
        metrics: {
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0
        }
      })
    })
  }

  private buildRoutingTable(): void {
    // 构建国家到区域的映射表
    this.routingTable.clear()
    
    // 亚洲地区路由
    this.routingTable.set('CN', ['ap-northeast-1', 'ap-east-1']) // 中国
    this.routingTable.set('JP', ['ap-northeast-1']) // 日本
    this.routingTable.set('KR', ['ap-northeast-1']) // 韩国
    this.routingTable.set('SG', ['ap-southeast-1']) // 新加坡
    this.routingTable.set('IN', ['ap-south-1']) // 印度
    this.routingTable.set('TH', ['ap-southeast-1']) // 泰国
    this.routingTable.set('VN', ['ap-southeast-1']) // 越南

    // 欧洲地区路由
    this.routingTable.set('GB', ['eu-west-2']) // 英国
    this.routingTable.set('DE', ['eu-central-1']) // 德国
    this.routingTable.set('FR', ['eu-west-3']) // 法国
    this.routingTable.set('NL', ['eu-west-1']) // 荷兰
    this.routingTable.set('IT', ['eu-south-1']) // 意大利
    this.routingTable.set('ES', ['eu-south-1']) // 西班牙

    // 北美地区路由
    this.routingTable.set('US', ['us-east-1', 'us-west-2']) // 美国
    this.routingTable.set('CA', ['ca-central-1']) // 加拿大
    this.routingTable.set('MX', ['us-east-1']) // 墨西哥

    // 南美地区路由
    this.routingTable.set('BR', ['sa-east-1']) // 巴西
    this.routingTable.set('AR', ['sa-east-1']) // 阿根廷
    this.routingTable.set('CL', ['sa-east-1']) // 智利

    // 大洋洲地区路由
    this.routingTable.set('AU', ['ap-southeast-2']) // 澳大利亚
    this.routingTable.set('NZ', ['ap-southeast-2']) // 新西兰

    // 非洲地区路由
    this.routingTable.set('ZA', ['af-south-1']) // 南非
    this.routingTable.set('NG', ['eu-west-1']) // 尼日利亚
  }

  // 根据用户地理位置获取最佳区域
  async getOptimalRegion(geoLocation: GeoLocation): Promise<Region | null> {
    const country = geoLocation.country.toUpperCase()
    const candidateRegionIds = this.routingTable.get(country) || this.getFallbackRegions()

    // 过滤健康的区域
    const healthyRegions = candidateRegionIds
      .map(id => this.regions.get(id))
      .filter(region => 
        region && 
        region.status === 'active' && 
        this.healthChecks.get(region.id)?.status === 'healthy'
      ) as Region[]

    if (healthyRegions.length === 0) {
      return this.getHealthyRegion() // 返回任意健康区域
    }

    // 根据负载均衡策略选择区域
    return this.selectRegionByStrategy(healthyRegions, geoLocation)
  }

  private selectRegionByStrategy(regions: Region[], geoLocation: GeoLocation): Region {
    const strategy = this.config.loadBalancing.strategy

    switch (strategy) {
      case 'geographic':
        return this.selectByGeography(regions, geoLocation)
      case 'weighted':
        return this.selectByWeight(regions)
      case 'least-connections':
        return this.selectByLeastConnections(regions)
      case 'round-robin':
      default:
        return this.selectRoundRobin(regions)
    }
  }

  private selectByGeography(regions: Region[], geoLocation: GeoLocation): Region {
    // 计算距离并选择最近的区域
    let closestRegion = regions[0]
    let minDistance = this.calculateDistance(
      geoLocation.latitude,
      geoLocation.longitude,
      closestRegion.location.latitude,
      closestRegion.location.longitude
    )

    for (let i = 1; i < regions.length; i++) {
      const distance = this.calculateDistance(
        geoLocation.latitude,
        geoLocation.longitude,
        regions[i].location.latitude,
        regions[i].location.longitude
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closestRegion = regions[i]
      }
    }

    return closestRegion
  }

  private selectByWeight(regions: Region[]): Region {
    const weights = this.config.loadBalancing.weights
    const totalWeight = regions.reduce((sum, region) => sum + (weights[region.id] || 1), 0)
    let random = Math.random() * totalWeight

    for (const region of regions) {
      random -= weights[region.id] || 1
      if (random <= 0) {
        return region
      }
    }

    return regions[0]
  }

  private selectByLeastConnections(regions: Region[]): Region {
    return regions.reduce((min, region) => 
      region.capacity.currentUsers < min.capacity.currentUsers ? region : min
    )
  }

  private selectRoundRobin(regions: Region[]): Region {
    // 简单的轮询实现
    const index = Math.floor(Date.now() / 1000) % regions.length
    return regions[index]
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private getFallbackRegions(): string[] {
    // 返回默认的健康区域
    return ['us-east-1', 'eu-west-1', 'ap-southeast-1']
  }

  private getHealthyRegion(): Region | null {
    for (const region of this.regions.values()) {
      if (region.status === 'active' && 
          this.healthChecks.get(region.id)?.status === 'healthy') {
        return region
      }
    }
    return null
  }

  // 获取区域信息
  getRegion(regionId: string): Region | undefined {
    return this.regions.get(regionId)
  }

  // 获取所有区域
  getAllRegions(): Region[] {
    return Array.from(this.regions.values())
  }

  // 获取健康区域
  getHealthyRegions(): Region[] {
    return this.getAllRegions().filter(region => 
      region.status === 'active' && 
      this.healthChecks.get(region.id)?.status === 'healthy'
    )
  }

  // 更新区域健康状态
  updateHealthCheck(regionId: string, healthCheck: Partial<HealthCheck>): void {
    const existing = this.healthChecks.get(regionId)
    if (existing) {
      this.healthChecks.set(regionId, { ...existing, ...healthCheck, lastCheck: new Date() })
    }
  }

  // 获取健康检查结果
  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values())
  }

  // 获取区域统计信息
  getRegionStats(): {
    total: number
    active: number
    healthy: number
    totalUsers: number
    averageLatency: number
  } {
    const regions = this.getAllRegions()
    const healthChecks = this.getHealthChecks()
    
    return {
      total: regions.length,
      active: regions.filter(r => r.status === 'active').length,
      healthy: healthChecks.filter(h => h.status === 'healthy').length,
      totalUsers: regions.reduce((sum, r) => sum + r.capacity.currentUsers, 0),
      averageLatency: healthChecks.reduce((sum, h) => sum + h.responseTime, 0) / healthChecks.length || 0
    }
  }

  // 获取配置
  getConfig(): DeploymentConfig {
    return this.config
  }

  // 更新配置
  updateConfig(updates: Partial<DeploymentConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}