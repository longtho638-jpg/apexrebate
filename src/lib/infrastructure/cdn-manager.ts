/**
 * CDN管理器 - 处理内容分发网络配置和优化
 */

// Simple CDN manager without AWS SDK dependency for ApexRebate
import { db } from '@/lib/db'

export interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'fastly' | 'akamai'
  distributionId: string
  domain: string
  cacheRules: CacheRule[]
  compression: {
    enabled: boolean
    level: 'low' | 'medium' | 'high'
    mimeTypes: string[]
  }
  security: {
    httpsOnly: boolean
    hsts: boolean
    securityHeaders: SecurityHeader[]
  }
  geoRestrictions: {
    enabled: boolean
    allowedCountries: string[]
    blockedCountries: string[]
  }
  rateLimiting: {
    enabled: boolean
    requestsPerSecond: number
    burstLimit: number
  }
}

export interface CacheRule {
  id: string
  path: string
  ttl: number
  cacheKey: string
  compress: boolean
  headers: string[]
  methods: string[]
  edgeFunctions?: EdgeFunction[]
}

export interface EdgeFunction {
  name: string
  path: string
  trigger: 'request' | 'response'
  code: string
  runtime: 'cloudflare-workers' | 'aws-lambda' | 'fastly-compute'
}

export interface SecurityHeader {
  name: string
  value: string
  enabled: boolean
}

export interface CDNMetrics {
  requests: number
  bandwidth: number // bytes
  cacheHitRate: number
  averageResponseTime: number
  errorRate: number
  topCountries: Array<{
    country: string
    requests: number
    bandwidth: number
  }>
  topPaths: Array<{
    path: string
    requests: number
    cacheHitRate: number
  }>
}

export interface PurgeRequest {
  urls: string[]
  tags?: string[]
  invalidateAll: boolean
}

export class CDNManager {
  private config: CDNConfig
  private metrics: CDNMetrics
  private lastUpdate: Date

  constructor(config: CDNConfig) {
    this.config = config
    this.metrics = this.initializeMetrics()
    this.lastUpdate = new Date()
  }

  private initializeMetrics(): CDNMetrics {
    return {
      requests: 0,
      bandwidth: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      errorRate: 0,
      topCountries: [],
      topPaths: []
    }
  }

  // 获取CDN配置
  getConfig(): CDNConfig {
    return this.config
  }

  // 更新CDN配置
  updateConfig(updates: Partial<CDNConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // 添加缓存规则
  addCacheRule(rule: CacheRule): void {
    this.config.cacheRules.push(rule)
  }

  // 移除缓存规则
  removeCacheRule(ruleId: string): boolean {
    const index = this.config.cacheRules.findIndex(rule => rule.id === ruleId)
    if (index > -1) {
      this.config.cacheRules.splice(index, 1)
      return true
    }
    return false
  }

  // 更新缓存规则
  updateCacheRule(ruleId: string, updates: Partial<CacheRule>): boolean {
    const rule = this.config.cacheRules.find(r => r.id === ruleId)
    if (rule) {
      Object.assign(rule, updates)
      return true
    }
    return false
  }

  // 获取缓存规则
  getCacheRules(): CacheRule[] {
    return this.config.cacheRules
  }

  // 根据路径获取缓存规则
  getCacheRuleForPath(path: string): CacheRule | null {
    // 按优先级排序，最长路径匹配优先
    const sortedRules = this.config.cacheRules
      .filter(rule => this.pathMatches(path, rule.path))
      .sort((a, b) => b.path.length - a.path.length)

    return sortedRules[0] || null
  }

  private pathMatches(requestPath: string, rulePath: string): boolean {
    // 简单的路径匹配逻辑
    if (rulePath === '*') return true
    if (rulePath.endsWith('*')) {
      const prefix = rulePath.slice(0, -1)
      return requestPath.startsWith(prefix)
    }
    return requestPath === rulePath
  }

  // 清除CDN缓存
  async purgeCache(request: PurgeRequest): Promise<boolean> {
    try {
      if (this.config.provider === 'cloudflare') {
        return await this.purgeCloudflareCache(request)
      } else if (this.config.provider === 'aws-cloudfront') {
        return await this.purgeCloudFrontCache(request)
      } else if (this.config.provider === 'fastly') {
        return await this.purgeFastlyCache(request)
      } else if (this.config.provider === 'akamai') {
        return await this.purgeAkamaiCache(request)
      }
      return false
    } catch (error) {
      console.error('CDN缓存清除失败:', error)
      return false
    }
  }

  private async purgeCloudflareCache(request: PurgeRequest): Promise<boolean> {
    // Cloudflare API调用
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.distributionId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: request.invalidateAll ? [] : request.urls,
        purge_everything: request.invalidateAll,
        tags: request.tags || []
      })
    })

    const data = await response.json()
    return data.success
  }

  private async purgeCloudFrontCache(request: PurgeRequest): Promise<boolean> {
    // AWS CloudFront API call - simplified version without SDK
    console.log('CloudFront cache purge requested:', request)
    return true
  }

  private async purgeFastlyCache(request: PurgeRequest): Promise<boolean> {
    // Fastly API调用
    const response = await fetch(`https://api.fastly.com/purge`, {
      method: 'POST',
      headers: {
        'Fastly-Key': process.env.FASTLY_API_KEY,
        'Fastly-Soft-Purge': '1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        purge: request.invalidateAll ? 'all' : request.urls,
        headers: request.tags ? { 'Fastly-Key': request.tags } : undefined
      })
    })

    return response.ok
  }

  private async purgeAkamaiCache(request: PurgeRequest): Promise<boolean> {
    // Akamai API调用（简化实现）
    console.log('Akamai缓存清除:', request)
    return true
  }

  // 获取CDN指标
  async getMetrics(): Promise<CDNMetrics> {
    try {
      if (this.config.provider === 'cloudflare') {
        return await this.getCloudflareMetrics()
      } else if (this.config.provider === 'aws-cloudfront') {
        return await this.getCloudFrontMetrics()
      } else if (this.config.provider === 'fastly') {
        return await this.getFastlyMetrics()
      } else if (this.config.provider === 'akamai') {
        return await this.getAkamaiMetrics()
      }
      return this.metrics
    } catch (error) {
      console.error('获取CDN指标失败:', error)
      return this.metrics
    }
  }

  private async getCloudflareMetrics(): Promise<CDNMetrics> {
    // Cloudflare Analytics API调用
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${this.config.distributionId}/analytics/dashboard?since=-24`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`
      }
    })

    const data = await response.json()
    
    return {
      requests: data.result?.totals?.requests?.all || 0,
      bandwidth: data.result?.totals?.bandwidth?.all || 0,
      cacheHitRate: data.result?.totals?.cache_status?.hit || 0,
      averageResponseTime: data.result?.totals?.response_time?.avg || 0,
      errorRate: data.result?.totals?.requests['5xx'] || 0,
      topCountries: [],
      topPaths: []
    }
  }

  private async getCloudFrontMetrics(): Promise<CDNMetrics> {
    // AWS CloudWatch API call - simplified version without SDK
    console.log('CloudFront metrics requested')
    return this.metrics
  }

  private async getFastlyMetrics(): Promise<CDNMetrics> {
    // Fastly Analytics API调用
    const response = await fetch(`https://api.fastly.com/stats/usage?from=${Math.floor(Date.now() / 1000) - 86400}&to=${Math.floor(Date.now() / 1000)}`, {
      headers: {
        'Fastly-Key': process.env.FASTLY_API_KEY
      }
    })

    const data = await response.json()
    
    return {
      requests: data.data?.requests || 0,
      bandwidth: data.data?.bandwidth || 0,
      cacheHitRate: data.data?.hit_ratio || 0,
      averageResponseTime: this.metrics.averageResponseTime,
      errorRate: this.metrics.errorRate,
      topCountries: [],
      topPaths: []
    }
  }

  private async getAkamaiMetrics(): Promise<CDNMetrics> {
    // Akamai API调用（简化实现）
    return this.metrics
  }

  // 预热CDN缓存
  async warmupCache(urls: string[]): Promise<boolean> {
    try {
      const promises = urls.map(url => this.warmupUrl(url))
      const results = await Promise.allSettled(promises)
      return results.every(result => result.status === 'fulfilled')
    } catch (error) {
      console.error('CDN缓存预热失败:', error)
      return false
    }
  }

  private async warmupUrl(url: string): Promise<void> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'ApexRebate-Cache-Warmer/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`预热失败: ${url} - ${response.status}`)
    }
  }

  // 设置地理位置限制
  setGeoRestrictions(allowedCountries: string[], blockedCountries: string[]): void {
    this.config.geoRestrictions = {
      enabled: true,
      allowedCountries,
      blockedCountries
    }
  }

  // 检查地理位置是否被允许
  isGeoAllowed(country: string): boolean {
    if (!this.config.geoRestrictions.enabled) {
      return true
    }

    const { allowedCountries, blockedCountries } = this.config.geoRestrictions

    if (blockedCountries.includes(country)) {
      return false
    }

    if (allowedCountries.length > 0 && !allowedCountries.includes(country)) {
      return false
    }

    return true
  }

  // 添加边缘函数
  addEdgeFunction(func: EdgeFunction): void {
    const rule = this.getCacheRuleForPath(func.path)
    if (rule) {
      rule.edgeFunctions = rule.edgeFunctions || []
      rule.edgeFunctions.push(func)
    }
  }

  // 获取边缘函数
  getEdgeFunctions(): EdgeFunction[] {
    const functions: EdgeFunction[] = []
    this.config.cacheRules.forEach(rule => {
      if (rule.edgeFunctions) {
        functions.push(...rule.edgeFunctions)
      }
    })
    return functions
  }

  // 优化CDN配置
  optimizeConfig(): void {
    // 自动优化缓存规则
    this.optimizeCacheRules()
    
    // 优化压缩设置
    this.optimizeCompression()
    
    // 优化安全设置
    this.optimizeSecurity()
  }

  private optimizeCacheRules(): void {
    // 根据内容类型优化TTL
    this.config.cacheRules.forEach(rule => {
      if (rule.path.includes('/api/')) {
        rule.ttl = Math.min(rule.ttl, 300) // API缓存不超过5分钟
      } else if (rule.path.includes('/static/')) {
        rule.ttl = Math.max(rule.ttl, 86400) // 静态资源缓存至少1天
      }
    })
  }

  private optimizeCompression(): void {
    // 启用常用文件类型的压缩
    if (!this.config.compression.mimeTypes.length) {
      this.config.compression.mimeTypes = [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'image/svg+xml'
      ]
    }
  }

  private optimizeSecurity(): void {
    // 确保安全头设置
    const requiredHeaders = [
      { name: 'X-Content-Type-Options', value: 'nosniff', enabled: true },
      { name: 'X-Frame-Options', value: 'DENY', enabled: true },
      { name: 'X-XSS-Protection', value: '1; mode=block', enabled: true }
    ]

    requiredHeaders.forEach(header => {
      if (!this.config.security.securityHeaders.find(h => h.name === header.name)) {
        this.config.security.securityHeaders.push(header)
      }
    })
  }

  // 获取配置摘要
  getConfigSummary(): {
    provider: string
    domain: string
    cacheRules: number
    edgeFunctions: number
    geoRestrictions: boolean
    compressionEnabled: boolean
    httpsOnly: boolean
  } {
    return {
      provider: this.config.provider,
      domain: this.config.domain,
      cacheRules: this.config.cacheRules.length,
      edgeFunctions: this.getEdgeFunctions().length,
      geoRestrictions: this.config.geoRestrictions.enabled,
      compressionEnabled: this.config.compression.enabled,
      httpsOnly: this.config.security.httpsOnly
    }
  }
}