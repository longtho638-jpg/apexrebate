// System Health Check and Auto-Recovery
// Comprehensive health monitoring with automatic recovery capabilities

import { logger, healthLogger, ApexError } from './logging';
import { db } from './db';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  recovery?: () => Promise<boolean>;
  critical: boolean;
  timeout: number;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  loadAverage: number[];
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'recovering';
  lastCheck: Date;
  lastSuccess?: Date;
  consecutiveFailures: number;
  metrics?: any;
}

class HealthMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  private services: Map<string, ServiceStatus> = new Map();
  private isRunning = false;
  private checkInterval = 60000; // 1 minute
  private metricsInterval = 30000; // 30 seconds
  private recoveryAttempts = new Map<string, number>();
  private maxRecoveryAttempts = 3;

  constructor() {
    this.initializeDefaultChecks();
  }

  // Initialize default health checks
  private initializeDefaultChecks() {
    // Database health check
    this.addCheck({
      name: 'database',
      check: async () => {
        try {
          await db.$queryRaw`SELECT 1`;
          return true;
        } catch (error) {
          logger.error('Database health check failed', { error: error.message });
          return false;
        }
      },
      recovery: async () => {
        try {
          // Try to reconnect to database
          await db.$disconnect();
          await db.$connect();
          return true;
        } catch (error) {
          logger.error('Database recovery failed', { error: error.message });
          return false;
        }
      },
      critical: true,
      timeout: 5000
    });

    // File system health check
    this.addCheck({
      name: 'filesystem',
      check: async () => {
        try {
          const testFile = path.join(process.cwd(), 'logs', 'health-check.tmp');
          fs.writeFileSync(testFile, 'health-check');
          fs.unlinkSync(testFile);
          return true;
        } catch (error) {
          logger.error('File system health check failed', { error: error.message });
          return false;
        }
      },
      critical: true,
      timeout: 3000
    });

    // Memory usage check
    this.addCheck({
      name: 'memory',
      check: async () => {
        const metrics = await this.getSystemMetrics();
        const isHealthy = metrics.memory < 85; // Less than 85% memory usage
        if (!isHealthy) {
          logger.warn('High memory usage detected', { memory: metrics.memory });
        }
        return isHealthy;
      },
      recovery: async () => {
        try {
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }
          
          // Clear any caches
          this.clearCaches();
          
          const metrics = await this.getSystemMetrics();
          return metrics.memory < 85;
        } catch (error) {
          logger.error('Memory recovery failed', { error: error.message });
          return false;
        }
      },
      critical: false,
      timeout: 2000
    });

    // Disk space check
    this.addCheck({
      name: 'disk',
      check: async () => {
        const metrics = await this.getSystemMetrics();
        const isHealthy = metrics.disk < 90; // Less than 90% disk usage
        if (!isHealthy) {
          logger.warn('Low disk space detected', { disk: metrics.disk });
        }
        return isHealthy;
      },
      recovery: async () => {
        try {
          // Clean up old logs
          await this.cleanupOldFiles();
          
          const metrics = await this.getSystemMetrics();
          return metrics.disk < 90;
        } catch (error) {
          logger.error('Disk recovery failed', { error: error.message });
          return false;
        }
      },
      critical: true,
      timeout: 3000
    });

    // External API health check
    this.addCheck({
      name: 'external_apis',
      check: async () => {
        try {
          // Check if external APIs are accessible
          const response = await fetch('https://api.binance.com/api/v3/ping', {
            signal: AbortSignal.timeout(5000)
          });
          return response.ok;
        } catch (error) {
          logger.warn('External API health check failed', { error: error.message });
          return false; // Don't fail completely for external APIs
        }
      },
      critical: false,
      timeout: 5000
    });

    // Application-specific checks
    this.addCheck({
      name: 'application',
      check: async () => {
        try {
          // Check if core application components are working
          const userCount = await db.user.count();
          return userCount >= 0; // Should always be true if DB is working
        } catch (error) {
          logger.error('Application health check failed', { error: error.message });
          return false;
        }
      },
      critical: true,
      timeout: 3000
    });
  }

  // Add a custom health check
  addCheck(check: HealthCheck) {
    this.checks.set(check.name, check);
    
    // Initialize service status
    this.services.set(check.name, {
      name: check.name,
      status: 'healthy',
      lastCheck: new Date(),
      consecutiveFailures: 0
    });
  }

  // Remove a health check
  removeCheck(name: string) {
    this.checks.delete(name);
    this.services.delete(name);
  }

  // Get system metrics
  private async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)"');
      const cpuMatch = stdout.match(/(\d+\.?\d*)%us/);
      const cpu = cpuMatch ? parseFloat(cpuMatch[1]) : 0;

      const { stdout: memStdout } = await execAsync('free');
      const memMatch = memStdout.match(/Mem:\s+(\d+)\s+(\d+)/);
      const memory = memMatch ? (parseFloat(memMatch[2]) / parseFloat(memMatch[1])) * 100 : 0;

      const { stdout: diskStdout } = await execAsync('df /');
      const diskMatch = diskStdout.match(/(\d+)%/);
      const disk = diskMatch ? parseInt(diskMatch[1]) : 0;

      const loadAvg = os.loadavg();
      const uptime = os.uptime();

      return {
        cpu,
        memory,
        disk,
        uptime,
        loadAverage: loadAvg
      };
    } catch (error) {
      logger.error('Failed to get system metrics', { error: error.message });
      return {
        cpu: 0,
        memory: 0,
        disk: 0,
        uptime: 0,
        loadAverage: [0, 0, 0]
      };
    }
  }

  // Clear application caches
  private clearCaches() {
    // Clear any in-memory caches
    if (global.cache) {
      global.cache.clear();
    }
    
    // Clear Node.js module cache (development only)
    if (process.env.NODE_ENV === 'development') {
      Object.keys(require.cache).forEach(key => {
        delete require.cache[key];
      });
    }
  }

  // Clean up old files
  private async cleanupOldFiles() {
    const logsDir = path.join(process.cwd(), 'logs');
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = Date.now();

    try {
      if (fs.existsSync(logsDir)) {
        const files = fs.readdirSync(logsDir);
        
        for (const file of files) {
          const filePath = path.join(logsDir, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            logger.info('Cleaned up old file', { file });
          }
        }
      }
    } catch (error) {
      logger.error('Failed to cleanup old files', { error: error.message });
    }
  }

  // Execute a single health check
  private async executeCheck(check: HealthCheck): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Set timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), check.timeout);
      });

      const result = await Promise.race([
        check.check(),
        timeoutPromise
      ]);

      const duration = Date.now() - startTime;
      
      healthLogger(check.name, result ? 'healthy' : 'unhealthy', {
        duration: `${duration}ms`,
        timeout: check.timeout
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      healthLogger(check.name, 'unhealthy', {
        error: error.message,
        duration: `${duration}ms`
      });

      return false;
    }
  }

  // Attempt recovery for a failed service
  private async attemptRecovery(checkName: string): Promise<boolean> {
    const check = this.checks.get(checkName);
    const service = this.services.get(checkName);
    
    if (!check || !check.recovery || !service) {
      return false;
    }

    const attempts = this.recoveryAttempts.get(checkName) || 0;
    if (attempts >= this.maxRecoveryAttempts) {
      logger.error('Max recovery attempts reached', { 
        service: checkName, 
        attempts: this.maxRecoveryAttempts 
      });
      return false;
    }

    logger.info('Attempting recovery', { service: checkName, attempt: attempts + 1 });
    
    service.status = 'recovering';
    this.recoveryAttempts.set(checkName, attempts + 1);

    try {
      const recoveryResult = await check.recovery();
      
      if (recoveryResult) {
        logger.info('Recovery successful', { service: checkName });
        this.recoveryAttempts.delete(checkName);
        return true;
      } else {
        logger.warn('Recovery failed', { service: checkName });
        return false;
      }
    } catch (error) {
      logger.error('Recovery error', { 
        service: checkName, 
        error: error.message 
      });
      return false;
    }
  }

  // Run all health checks
  private async runHealthChecks(): Promise<void> {
    const results: Record<string, boolean> = {};
    let hasCriticalFailures = false;

    for (const [name, check] of this.checks) {
      const service = this.services.get(name)!;
      
      try {
        const isHealthy = await this.executeCheck(check);
        results[name] = isHealthy;

        if (isHealthy) {
          service.status = 'healthy';
          service.lastSuccess = new Date();
          service.consecutiveFailures = 0;
          this.recoveryAttempts.delete(name);
        } else {
          service.consecutiveFailures++;
          
          if (check.critical) {
            hasCriticalFailures = true;
          }

          // Attempt recovery if configured
          if (check.recovery && service.consecutiveFailures === 1) {
            const recoverySuccess = await this.attemptRecovery(name);
            if (recoverySuccess) {
              results[name] = true;
              service.status = 'healthy';
              service.lastSuccess = new Date();
              service.consecutiveFailures = 0;
            }
          } else if (service.consecutiveFailures > 1 && check.recovery) {
            // Try recovery again after multiple failures
            const recoverySuccess = await this.attemptRecovery(name);
            if (recoverySuccess) {
              results[name] = true;
              service.status = 'healthy';
              service.lastSuccess = new Date();
              service.consecutiveFailures = 0;
            }
          }
        }

        service.lastCheck = new Date();
      } catch (error) {
        logger.error('Health check error', { 
          service: name, 
          error: error.message 
        });
        results[name] = false;
        service.status = 'unhealthy';
        service.consecutiveFailures++;
        service.lastCheck = new Date();
      }
    }

    // Log overall health status
    const healthyCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    if (hasCriticalFailures) {
      logger.error('Critical health check failures detected', {
        healthy: healthyCount,
        total: totalCount,
        failed: totalCount - healthyCount
      });
    } else {
      logger.info('Health checks completed', {
        healthy: healthyCount,
        total: totalCount,
        failed: totalCount - healthyCount
      });
    }

    // Update overall system health
    await this.updateSystemHealth(results);
  }

  // Update system health metrics
  private async updateSystemHealth(checkResults: Record<string, boolean>): Promise<void> {
    try {
      const metrics = await this.getSystemMetrics();
      
      // Store metrics for monitoring
      const healthData = {
        timestamp: new Date(),
        checks: checkResults,
        metrics,
        overall: Object.values(checkResults).every(Boolean) ? 'healthy' : 'unhealthy'
      };

      // Save to database or monitoring system
      await this.saveHealthMetrics(healthData);
      
    } catch (error) {
      logger.error('Failed to update system health', { error: error.message });
    }
  }

  // Save health metrics to database
  private async saveHealthMetrics(healthData: any): Promise<void> {
    try {
      // This would typically save to a health_metrics table
      // For now, just log the data
      logger.debug('Health metrics saved', healthData);
    } catch (error) {
      logger.error('Failed to save health metrics', { error: error.message });
    }
  }

  // Get current health status
  async getHealthStatus(): Promise<{
    overall: 'healthy' | 'unhealthy' | 'degraded';
    services: Record<string, ServiceStatus>;
    metrics: SystemMetrics;
    timestamp: Date;
  }> {
    const metrics = await this.getSystemMetrics();
    const services: Record<string, ServiceStatus> = {};
    
    for (const [name, service] of this.services) {
      services[name] = { ...service };
    }

    const criticalServices = Array.from(this.services.values())
      .filter(service => this.checks.get(service.name)?.critical);
    
    const criticalHealthy = criticalServices
      .filter(service => service.status === 'healthy').length;
    
    let overall: 'healthy' | 'unhealthy' | 'degraded';
    
    if (criticalHealthy === criticalServices.length) {
      overall = 'healthy';
    } else if (criticalHealthy === 0) {
      overall = 'unhealthy';
    } else {
      overall = 'degraded';
    }

    return {
      overall,
      services,
      metrics,
      timestamp: new Date()
    };
  }

  // Start health monitoring
  start(): void {
    if (this.isRunning) {
      logger.warn('Health monitor is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting health monitor');

    // Run health checks immediately
    this.runHealthChecks();

    // Schedule regular health checks
    this.healthCheckInterval = setInterval(() => {
      this.runHealthChecks();
    }, this.checkInterval);

    // Schedule metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.metricsInterval);
  }

  // Stop health monitoring
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    logger.info('Stopping health monitor');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  // Collect system metrics
  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.getSystemMetrics();
      
      logger.debug('System metrics collected', metrics);
      
      // Check for alerts
      if (metrics.cpu > 80) {
        logger.warn('High CPU usage detected', { cpu: metrics.cpu });
      }
      
      if (metrics.memory > 85) {
        logger.warn('High memory usage detected', { memory: metrics.memory });
      }
      
      if (metrics.disk > 90) {
        logger.error('Critical disk usage detected', { disk: metrics.disk });
      }
      
    } catch (error) {
      logger.error('Failed to collect metrics', { error: error.message });
    }
  }

  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
}

// Create singleton instance
const healthMonitor = new HealthMonitor();

// Export health monitor instance and utilities
export { healthMonitor, HealthMonitor };
export type { HealthCheck, ServiceStatus, SystemMetrics };

// Auto-start health monitor in production
if (process.env.NODE_ENV === 'production') {
  healthMonitor.start();
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Shutting down health monitor');
  healthMonitor.stop();
});

process.on('SIGINT', () => {
  logger.info('Shutting down health monitor');
  healthMonitor.stop();
});