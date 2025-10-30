// Performance Optimization and Caching Strategies
// Comprehensive caching and performance optimization system

import { logger, performanceLogger } from './logging';
import LRU from 'lru-cache';
import Redis from 'ioredis';
import { createHash } from 'crypto';

// Cache configuration
interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number; // Maximum number of items
  strategy: 'memory' | 'redis' | 'hybrid';
  keyPrefix?: string;
}

// Cache item metadata
interface CacheItem<T> {
  data: T;
  expires: number;
  hits: number;
  lastAccessed: number;
}

// Performance metrics
interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
  totalRequests: number;
  errorRate: number;
}

class CacheManager {
  private memoryCache: LRU<string, any>;
  private redisClient?: Redis;
  private config: CacheConfig;
  private metrics: PerformanceMetrics;
  private isRedisConnected = false;

  constructor(config: CacheConfig) {
    this.config = config;
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      totalRequests: 0,
      errorRate: 0
    };

    // Initialize memory cache
    this.memoryCache = new LRU({
      max: config.maxSize || 1000,
      ttl: config.ttl * 1000, // Convert to milliseconds
      updateAgeOnGet: true
    });

    // Initialize Redis if needed
    if (config.strategy === 'redis' || config.strategy === 'hybrid') {
      this.initializeRedis();
    }
  }

  // Initialize Redis connection
  private async initializeRedis(): Promise<void> {
    try {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      this.redisClient.on('connect', () => {
        this.isRedisConnected = true;
        logger.info('Redis connected');
      });

      this.redisClient.on('error', (error) => {
        this.isRedisConnected = false;
        logger.error('Redis connection error', { error: error.message });
      });

      this.redisClient.on('close', () => {
        this.isRedisConnected = false;
        logger.warn('Redis connection closed');
      });

      await this.redisClient.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis', { error: error.message });
      this.isRedisConnected = false;
    }
  }

  // Generate cache key
  private generateKey(namespace: string, key: string): string {
    const prefix = this.config.keyPrefix || 'apexrebate';
    const hash = createHash('md5').update(key).digest('hex');
    return `${prefix}:${namespace}:${hash}`;
  }

  // Get item from cache
  async get<T>(namespace: string, key: string): Promise<T | null> {
    const startTime = Date.now();
    const cacheKey = this.generateKey(namespace, key);

    try {
      let data: T | null = null;

      // Try memory cache first
      if (this.config.strategy === 'memory' || this.config.strategy === 'hybrid') {
        data = this.memoryCache.get(cacheKey);
        if (data) {
          this.metrics.cacheHits++;
          this.updateMetrics(startTime);
          return data;
        }
      }

      // Try Redis if configured and connected
      if ((this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisConnected) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          const item: CacheItem<T> = JSON.parse(cached);
          
          // Check if expired
          if (item.expires > Date.now()) {
            data = item.data;
            
            // Store in memory cache for faster access
            if (this.config.strategy === 'hybrid') {
              this.memoryCache.set(cacheKey, data);
            }
            
            this.metrics.cacheHits++;
            this.updateMetrics(startTime);
            return data;
          } else {
            // Remove expired item
            await this.redisClient.del(cacheKey);
          }
        }
      }

      this.metrics.cacheMisses++;
      this.updateMetrics(startTime);
      return null;
    } catch (error) {
      logger.error('Cache get error', { 
        key: cacheKey, 
        error: error.message 
      });
      this.metrics.cacheMisses++;
      this.updateMetrics(startTime);
      return null;
    }
  }

  // Set item in cache
  async set<T>(namespace: string, key: string, data: T, customTtl?: number): Promise<void> {
    const cacheKey = this.generateKey(namespace, key);
    const ttl = customTtl || this.config.ttl;
    const expires = Date.now() + (ttl * 1000);

    try {
      const item: CacheItem<T> = {
        data,
        expires,
        hits: 0,
        lastAccessed: Date.now()
      };

      // Store in memory cache
      if (this.config.strategy === 'memory' || this.config.strategy === 'hybrid') {
        this.memoryCache.set(cacheKey, data);
      }

      // Store in Redis if configured and connected
      if ((this.config.strategy === 'redis' || this.config.strategy === 'hybrid') && this.isRedisConnected) {
        await this.redisClient.setex(
          cacheKey, 
          ttl, 
          JSON.stringify(item)
        );
      }
    } catch (error) {
      logger.error('Cache set error', { 
        key: cacheKey, 
        error: error.message 
      });
    }
  }

  // Delete item from cache
  async delete(namespace: string, key: string): Promise<void> {
    const cacheKey = this.generateKey(namespace, key);

    try {
      // Remove from memory cache
      this.memoryCache.delete(cacheKey);

      // Remove from Redis if configured and connected
      if (this.isRedisConnected) {
        await this.redisClient.del(cacheKey);
      }
    } catch (error) {
      logger.error('Cache delete error', { 
        key: cacheKey, 
        error: error.message 
      });
    }
  }

  // Clear cache namespace
  async clearNamespace(namespace: string): Promise<void> {
    const pattern = this.generateKey(namespace, '*');

    try {
      // Clear memory cache
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(pattern.replace('*', ''))) {
          this.memoryCache.delete(key);
        }
      }

      // Clear Redis if configured and connected
      if (this.isRedisConnected) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }
    } catch (error) {
      logger.error('Cache clear namespace error', { 
        namespace, 
        error: error.message 
      });
    }
  }

  // Get or set pattern (cache-aside)
  async getOrSet<T>(
    namespace: string, 
    key: string, 
    fetcher: () => Promise<T>, 
    customTtl?: number
  ): Promise<T> {
    // Try to get from cache first
    let data = await this.get<T>(namespace, key);
    
    if (data !== null) {
      return data;
    }

    // Cache miss - fetch data
    try {
      data = await fetcher();
      
      // Store in cache
      await this.set(namespace, key, data, customTtl);
      
      return data;
    } catch (error) {
      logger.error('Cache getOrSet fetch error', { 
        namespace, 
        key, 
        error: error.message 
      });
      throw error;
    }
  }

  // Update performance metrics
  private updateMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.totalRequests++;
    
    // Update average response time
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
  }

  // Get cache metrics
  getMetrics(): PerformanceMetrics & {
    hitRate: number;
    memoryCacheSize: number;
    redisConnected: boolean;
  } {
    return {
      ...this.metrics,
      hitRate: this.metrics.totalRequests > 0 
        ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100 
        : 0,
      memoryCacheSize: this.memoryCache.size,
      redisConnected: this.isRedisConnected
    };
  }

  // Warm up cache with common data
  async warmUp(dataLoaders: Array<{
    namespace: string;
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number;
  }>): Promise<void> {
    logger.info('Starting cache warm-up');

    const promises = dataLoaders.map(async ({ namespace, key, fetcher, ttl }) => {
      try {
        await this.getOrSet(namespace, key, fetcher, ttl);
      } catch (error) {
        logger.error('Cache warm-up error', { 
          namespace, 
          key, 
          error: error.message 
        });
      }
    });

    await Promise.all(promises);
    logger.info('Cache warm-up completed');
  }

  // Close connections
  async close(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

// Cache instances for different purposes
export const userCache = new CacheManager({
  ttl: 300, // 5 minutes
  maxSize: 1000,
  strategy: 'hybrid',
  keyPrefix: 'user'
});

export const analyticsCache = new CacheManager({
  ttl: 600, // 10 minutes
  maxSize: 500,
  strategy: 'memory',
  keyPrefix: 'analytics'
});

export const brokerDataCache = new CacheManager({
  ttl: 60, // 1 minute
  maxSize: 100,
  strategy: 'hybrid',
  keyPrefix: 'broker'
});

export const pageCache = new CacheManager({
  ttl: 1800, // 30 minutes
  maxSize: 200,
  strategy: 'memory',
  keyPrefix: 'page'
});

// Performance monitoring middleware
export function performanceMonitor() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const endTimer = performanceLogger('api_request');

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      endTimer();

      // Log slow requests
      if (duration > 1000) {
        logger.warn('Slow API request detected', {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          statusCode: res.statusCode
        });
      }

      // Update metrics
      const metrics = {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date()
      };

      // Store metrics for analysis
      storePerformanceMetrics(metrics);
    });

    next();
  };
}

// Store performance metrics
async function storePerformanceMetrics(metrics: any): Promise<void> {
  try {
    const key = `performance:${new Date().toISOString().split('T')[0]}`;
    await analyticsCache.set('daily_metrics', key, metrics, 86400); // 24 hours
  } catch (error) {
    logger.error('Failed to store performance metrics', { error: error.message });
  }
}

// Response caching middleware
export function responseCache(options: {
  ttl?: number;
  keyGenerator?: (req: any) => string;
  skipCache?: (req: any) => boolean;
}) {
  const {
    ttl = 300,
    keyGenerator = (req) => `${req.method}:${req.url}`,
    skipCache = () => false
  } = options;

  return async (req: any, res: any, next: any) => {
    // Skip cache for certain requests
    if (skipCache(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    
    try {
      // Try to get cached response
      const cached = await pageCache.get('responses', cacheKey);
      
      if (cached) {
        logger.debug('Cache hit for response', { key: cacheKey });
        return res.json(cached);
      }

      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          pageCache.set('responses', cacheKey, data, ttl);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Response cache error', { error: error.message });
      next();
    }
  };
}

// Database query optimization
export function optimizeQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  cacheOptions?: {
    ttl?: number;
    key?: string;
  }
): () => Promise<T> {
  return async () => {
    const cacheKey = cacheOptions?.key || queryName;
    
    return analyticsCache.getOrSet(
      'queries',
      cacheKey,
      queryFn,
      cacheOptions?.ttl
    );
  };
}

// Batch processing utility
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delay: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    
    results.push(...batchResults);
    
    // Add delay between batches to prevent overwhelming
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  const usage = process.memoryUsage();
  
  logger.debug('Memory usage', {
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(usage.external / 1024 / 1024)}MB`
  });

  // Trigger garbage collection if memory usage is high
  if (usage.heapUsed > 500 * 1024 * 1024) { // 500MB
    if (global.gc) {
      global.gc();
      logger.info('Manual garbage collection triggered');
    }
  }
}

// Start memory monitoring
setInterval(monitorMemoryUsage, 60000); // Every minute

// Export cache utilities
export { CacheManager };
export type { CacheConfig, PerformanceMetrics };