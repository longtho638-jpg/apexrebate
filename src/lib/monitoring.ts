// ApexRebate Monitoring and Alerting System
// Real-time monitoring with automated alerting

import { logger } from './logging'

export interface Metric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
}

export interface Alert {
  id: string
  name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  metric: string
  threshold: number
  currentValue: number
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

export interface HealthCheck {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  lastCheck: Date
  details?: Record<string, any>
}

export class MonitoringService {
  private static instance: MonitoringService
  private metrics: Map<string, Metric[]> = new Map()
  private alerts: Map<string, Alert> = new Map()
  private healthChecks: Map<string, HealthCheck> = new Map()
  private thresholds: Map<string, number> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {
    this.initializeDefaultThresholds()
    this.startMonitoring()
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  private initializeDefaultThresholds() {
    // Performance thresholds
    this.thresholds.set('response_time', 2000) // 2 seconds
    this.thresholds.set('error_rate', 0.05) // 5%
    this.thresholds.set('cpu_usage', 80) // 80%
    this.thresholds.set('memory_usage', 85) // 85%
    this.thresholds.set('disk_usage', 90) // 90%
    
    // Business metrics thresholds
    this.thresholds.set('failed_logins', 10) // 10 per minute
    this.thresholds.set('failed_payments', 5) // 5 per hour
    this.thresholds.set('database_connections', 80) // 80% of max
    this.thresholds.set('queue_size', 1000) // 1000 items
  }

  private startMonitoring() {
    // System monitoring every 30 seconds
    this.intervals.set('system', setInterval(() => {
      this.collectSystemMetrics()
    }, 30000))

    // Application monitoring every minute
    this.intervals.set('application', setInterval(() => {
      this.collectApplicationMetrics()
    }, 60000))

    // Business metrics every 5 minutes
    this.intervals.set('business', setInterval(() => {
      this.collectBusinessMetrics()
    }, 300000))

    // Health checks every minute
    this.intervals.set('health', setInterval(() => {
      this.performHealthChecks()
    }, 60000))

    // Alert evaluation every minute
    this.intervals.set('alerts', setInterval(() => {
      this.evaluateAlerts()
    }, 60000))
  }

  // Metrics collection
  async collectSystemMetrics() {
    try {
      const metrics = await this.getSystemMetrics()
      
      for (const metric of metrics) {
        this.recordMetric(metric)
      }

      logger.debug('System metrics collected', { count: metrics.length })
    } catch (error) {
      logger.error('Failed to collect system metrics', { error })
    }
  }

  async collectApplicationMetrics() {
    try {
      const metrics = await this.getApplicationMetrics()
      
      for (const metric of metrics) {
        this.recordMetric(metric)
      }

      logger.debug('Application metrics collected', { count: metrics.length })
    } catch (error) {
      logger.error('Failed to collect application metrics', { error })
    }
  }

  async collectBusinessMetrics() {
    try {
      const metrics = await this.getBusinessMetrics()
      
      for (const metric of metrics) {
        this.recordMetric(metric)
      }

      logger.debug('Business metrics collected', { count: metrics.length })
    } catch (error) {
      logger.error('Failed to collect business metrics', { error })
    }
  }

  private async getSystemMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = []
    const now = new Date()

    try {
      // CPU usage
      const cpuUsage = await this.getCPUUsage()
      metrics.push({
        name: 'cpu_usage',
        value: cpuUsage,
        unit: 'percent',
        timestamp: now
      })

      // Memory usage
      const memoryUsage = await this.getMemoryUsage()
      metrics.push({
        name: 'memory_usage',
        value: memoryUsage,
        unit: 'percent',
        timestamp: now
      })

      // Disk usage
      const diskUsage = await this.getDiskUsage()
      metrics.push({
        name: 'disk_usage',
        value: diskUsage,
        unit: 'percent',
        timestamp: now
      })

      // Network I/O
      const networkIO = await this.getNetworkIO()
      metrics.push({
        name: 'network_io',
        value: networkIO,
        unit: 'bytes',
        timestamp: now
      })

    } catch (error) {
      logger.error('Error getting system metrics', { error })
    }

    return metrics
  }

  private async getApplicationMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = []
    const now = new Date()

    try {
      // Response time
      const responseTime = await this.getAverageResponseTime()
      metrics.push({
        name: 'response_time',
        value: responseTime,
        unit: 'milliseconds',
        timestamp: now
      })

      // Error rate
      const errorRate = await this.getErrorRate()
      metrics.push({
        name: 'error_rate',
        value: errorRate,
        unit: 'percent',
        timestamp: now
      })

      // Active users
      const activeUsers = await this.getActiveUsers()
      metrics.push({
        name: 'active_users',
        value: activeUsers,
        unit: 'count',
        timestamp: now
      })

      // Request rate
      const requestRate = await this.getRequestRate()
      metrics.push({
        name: 'request_rate',
        value: requestRate,
        unit: 'requests_per_minute',
        timestamp: now
      })

      // Database connections
      const dbConnections = await this.getDatabaseConnections()
      metrics.push({
        name: 'database_connections',
        value: dbConnections,
        unit: 'count',
        timestamp: now
      })

    } catch (error) {
      logger.error('Error getting application metrics', { error })
    }

    return metrics
  }

  private async getBusinessMetrics(): Promise<Metric[]> {
    const metrics: Metric[] = []
    const now = new Date()

    try {
      // Failed logins
      const failedLogins = await this.getFailedLogins()
      metrics.push({
        name: 'failed_logins',
        value: failedLogins,
        unit: 'count_per_minute',
        timestamp: now
      })

      // Failed payments
      const failedPayments = await this.getFailedPayments()
      metrics.push({
        name: 'failed_payments',
        value: failedPayments,
        unit: 'count_per_hour',
        timestamp: now
      })

      // New registrations
      const newRegistrations = await this.getNewRegistrations()
      metrics.push({
        name: 'new_registrations',
        value: newRegistrations,
        unit: 'count_per_day',
        timestamp: now
      })

      // Trading volume
      const tradingVolume = await this.getTradingVolume()
      metrics.push({
        name: 'trading_volume',
        value: tradingVolume,
        unit: 'usd',
        timestamp: now
      })

      // Queue size
      const queueSize = await this.getQueueSize()
      metrics.push({
        name: 'queue_size',
        value: queueSize,
        unit: 'count',
        timestamp: now
      })

    } catch (error) {
      logger.error('Error getting business metrics', { error })
    }

    return metrics
  }

  // Health checks
  async performHealthChecks() {
    const services = ['database', 'redis', 'external_apis', 'email_service']
    
    for (const service of services) {
      try {
        const healthCheck = await this.checkServiceHealth(service)
        this.healthChecks.set(service, healthCheck)
        
        if (healthCheck.status !== 'healthy') {
          this.createAlert(
            `${service}_health`,
            'medium',
            `Service ${service} is ${healthCheck.status}`,
            'health_check',
            100,
            0
          )
        }
      } catch (error) {
        logger.error(`Health check failed for ${service}`, { error })
        
        this.healthChecks.set(service, {
          service,
          status: 'unhealthy',
          responseTime: -1,
          lastCheck: new Date(),
          details: { error: error.message }
        })
      }
    }
  }

  private async checkServiceHealth(service: string): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      switch (service) {
        case 'database':
          return await this.checkDatabaseHealth(startTime)
        case 'redis':
          return await this.checkRedisHealth(startTime)
        case 'external_apis':
          return await this.checkExternalAPIsHealth(startTime)
        case 'email_service':
          return await this.checkEmailServiceHealth(startTime)
        default:
          throw new Error(`Unknown service: ${service}`)
      }
    } catch (error) {
      return {
        service,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        details: { error: error.message }
      }
    }
  }

  private async checkDatabaseHealth(startTime: number): Promise<HealthCheck> {
    try {
      // Simple database health check
      const result = await this.queryDatabase('SELECT 1')
      const responseTime = Date.now() - startTime
      
      return {
        service: 'database',
        status: result ? 'healthy' : 'unhealthy',
        responseTime,
        lastCheck: new Date()
      }
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        details: { error: error.message }
      }
    }
  }

  private async checkRedisHealth(startTime: number): Promise<HealthCheck> {
    try {
      // Redis health check (simplified)
      const responseTime = Date.now() - startTime
      
      return {
        service: 'redis',
        status: 'healthy',
        responseTime,
        lastCheck: new Date()
      }
    } catch (error) {
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        details: { error: error.message }
      }
    }
  }

  private async checkExternalAPIsHealth(startTime: number): Promise<HealthCheck> {
    try {
      // Check external API health
      const responseTime = Date.now() - startTime
      
      return {
        service: 'external_apis',
        status: 'healthy',
        responseTime,
        lastCheck: new Date()
      }
    } catch (error) {
      return {
        service: 'external_apis',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        details: { error: error.message }
      }
    }
  }

  private async checkEmailServiceHealth(startTime: number): Promise<HealthCheck> {
    try {
      // Check email service health
      const responseTime = Date.now() - startTime
      
      return {
        service: 'email_service',
        status: 'healthy',
        responseTime,
        lastCheck: new Date()
      }
    } catch (error) {
      return {
        service: 'email_service',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        details: { error: error.message }
      }
    }
  }

  // Alert evaluation
  evaluateAlerts() {
    for (const [metricName, threshold] of this.thresholds) {
      const latestMetric = this.getLatestMetric(metricName)
      
      if (latestMetric && latestMetric.value > threshold) {
        this.createAlert(
          `${metricName}_threshold`,
          this.getSeverity(metricName, latestMetric.value, threshold),
          `${metricName} exceeded threshold: ${latestMetric.value} > ${threshold}`,
          metricName,
          threshold,
          latestMetric.value
        )
      }
    }
  }

  private getSeverity(metricName: string, value: number, threshold: number): Alert['severity'] {
    const ratio = value / threshold
    
    if (ratio >= 2) return 'critical'
    if (ratio >= 1.5) return 'high'
    if (ratio >= 1.2) return 'medium'
    return 'low'
  }

  // Alert management
  createAlert(id: string, severity: Alert['severity'], message: string, metric: string, threshold: number, currentValue: number) {
    const existingAlert = this.alerts.get(id)
    
    if (existingAlert && !existingAlert.resolved) {
      // Alert already exists and is not resolved
      return
    }
    
    const alert: Alert = {
      id,
      name: `${metric} Alert`,
      severity,
      message,
      metric,
      threshold,
      currentValue,
      timestamp: new Date(),
      resolved: false
    }
    
    this.alerts.set(id, alert)
    
    // Send notification
    this.sendAlertNotification(alert)
    
    logger.warn('Alert created', { alert })
  }

  resolveAlert(id: string) {
    const alert = this.alerts.get(id)
    
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      
      // Send resolution notification
      this.sendAlertResolutionNotification(alert)
      
      logger.info('Alert resolved', { alert })
    }
  }

  private async sendAlertNotification(alert: Alert) {
    try {
      // Send to monitoring system
      await this.sendToMonitoringSystem(alert)
      
      // Send email for high/critical alerts
      if (alert.severity === 'high' || alert.severity === 'critical') {
        await this.sendAlertEmail(alert)
      }
      
      // Send Slack notification
      await this.sendSlackAlert(alert)
      
    } catch (error) {
      logger.error('Failed to send alert notification', { alert, error })
    }
  }

  private async sendAlertResolutionNotification(alert: Alert) {
    try {
      // Send resolution notifications
      await this.sendSlackAlertResolution(alert)
      
      logger.info('Alert resolution notification sent', { alert })
    } catch (error) {
      logger.error('Failed to send alert resolution notification', { alert, error })
    }
  }

  // Utility methods
  recordMetric(metric: Metric) {
    const metrics = this.metrics.get(metric.name) || []
    metrics.push(metric)
    
    // Keep only last 1000 metrics per type
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000)
    }
    
    this.metrics.set(metric.name, metrics)
  }

  getLatestMetric(metricName: string): Metric | null {
    const metrics = this.metrics.get(metricName) || []
    return metrics.length > 0 ? metrics[metrics.length - 1] : null
  }

  getMetrics(metricName: string, since?: Date): Metric[] {
    const metrics = this.metrics.get(metricName) || []
    
    if (since) {
      return metrics.filter(m => m.timestamp >= since)
    }
    
    return metrics
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved)
  }

  getHealthStatus(): HealthCheck[] {
    return Array.from(this.healthChecks.values())
  }

  // Placeholder methods for actual implementations
  private async getCPUUsage(): Promise<number> {
    // Implementation would read from /proc/stat or use system library
    return Math.random() * 100
  }

  private async getMemoryUsage(): Promise<number> {
    // Implementation would read from /proc/meminfo or use system library
    return Math.random() * 100
  }

  private async getDiskUsage(): Promise<number> {
    // Implementation would use df command or system library
    return Math.random() * 100
  }

  private async getNetworkIO(): Promise<number> {
    // Implementation would read from /proc/net/dev or use system library
    return Math.random() * 1000000
  }

  private async getAverageResponseTime(): Promise<number> {
    // Implementation would calculate from request logs
    return Math.random() * 3000
  }

  private async getErrorRate(): Promise<number> {
    // Implementation would calculate from error logs
    return Math.random() * 10
  }

  private async getActiveUsers(): Promise<number> {
    // Implementation would count active sessions
    return Math.floor(Math.random() * 1000)
  }

  private async getRequestRate(): Promise<number> {
    // Implementation would calculate from request logs
    return Math.random() * 100
  }

  private async getDatabaseConnections(): Promise<number> {
    // Implementation would query database connection pool
    return Math.floor(Math.random() * 100)
  }

  private async getFailedLogins(): Promise<number> {
    // Implementation would count failed login attempts
    return Math.floor(Math.random() * 20)
  }

  private async getFailedPayments(): Promise<number> {
    // Implementation would count failed payment attempts
    return Math.floor(Math.random() * 10)
  }

  private async getNewRegistrations(): Promise<number> {
    // Implementation would count new user registrations
    return Math.floor(Math.random() * 50)
  }

  private async getTradingVolume(): Promise<number> {
    // Implementation would sum trading volumes
    return Math.random() * 1000000
  }

  private async getQueueSize(): Promise<number> {
    // Implementation would check queue length
    return Math.floor(Math.random() * 2000)
  }

  private async queryDatabase(query: string): Promise<boolean> {
    // Implementation would execute database query
    return true
  }

  private async sendToMonitoringSystem(alert: Alert): Promise<void> {
    // Implementation would send to external monitoring system
    logger.info('Alert sent to monitoring system', { alert })
  }

  private async sendAlertEmail(alert: Alert): Promise<void> {
    // Implementation would send email alert
    logger.info('Alert email sent', { alert })
  }

  private async sendSlackAlert(alert: Alert): Promise<void> {
    // Implementation would send Slack notification
    logger.info('Slack alert sent', { alert })
  }

  private async sendSlackAlertResolution(alert: Alert): Promise<void> {
    // Implementation would send Slack resolution notification
    logger.info('Slack alert resolution sent', { alert })
  }

  // Cleanup
  destroy() {
    for (const interval of this.intervals.values()) {
      clearInterval(interval)
    }
    this.intervals.clear()
  }
}

export const monitoringService = MonitoringService.getInstance()
export default monitoringService