/**
 * 简化的Redis客户端
 * 提供基本的缓存功能
 */

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  setex(key: string, ttl: number, value: string): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: string): Promise<void>;
  hdel(key: string, field: string): Promise<void>;
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  lpush(key: string, value: string): Promise<number>;
  rpush(key: string, value: string): Promise<number>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  keys(pattern: string): Promise<string[]>;
}

export class SimpleRedisClient implements RedisClient {
  private cache: Map<string, { value: string; expiry?: number }> = new Map();
  private hashCache: Map<string, Map<string, string>> = new Map();
  private listCache: Map<string, string[]> = new Map();

  private isExpired(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return true;
    if (!item.expiry) return false;
    return Date.now() > item.expiry;
  }

  private cleanupExpired(): void {
    for (const [key] of this.cache) {
      if (this.isExpired(key)) {
        this.cache.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    this.cleanupExpired();
    const item = this.cache.get(key);
    return item ? item.value : null;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expiry });
  }

  async setex(key: string, ttl: number, value: string): Promise<void> {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
    this.hashCache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    this.cleanupExpired();
    return this.cache.has(key) || this.hashCache.has(key);
  }

  async expire(key: string, ttl: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expiry = Date.now() + ttl * 1000;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.hashCache.get(key);
    return hash ? hash.get(field) || null : null;
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.hashCache.has(key)) {
      this.hashCache.set(key, new Map());
    }
    this.hashCache.get(key)!.set(field, value);
  }

  async hdel(key: string, field: string): Promise<void> {
    const hash = this.hashCache.get(key);
    if (hash) {
      hash.delete(field);
      if (hash.size === 0) {
        this.hashCache.delete(key);
      }
    }
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const value = current ? parseInt(current, 10) + 1 : 1;
    await this.set(key, value.toString());
    return value;
  }

  async decr(key: string): Promise<number> {
    const current = await this.get(key);
    const value = current ? parseInt(current, 10) - 1 : -1;
    await this.set(key, value.toString());
    return value;
  }

  async lpush(key: string, value: string): Promise<number> {
    if (!this.listCache.has(key)) {
      this.listCache.set(key, []);
    }
    const list = this.listCache.get(key)!;
    list.unshift(value);
    return list.length;
  }

  async rpush(key: string, value: string): Promise<number> {
    if (!this.listCache.has(key)) {
      this.listCache.set(key, []);
    }
    const list = this.listCache.get(key)!;
    list.push(value);
    return list.length;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.listCache.get(key) || [];
    const actualStop = stop === -1 ? list.length : stop + 1;
    return list.slice(start, actualStop);
  }

  async keys(pattern: string): Promise<string[]> {
    // Simple pattern matching - only supports wildcard *
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matchingKeys: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        matchingKeys.push(key);
      }
    }
    
    return matchingKeys;
  }
}

export const redis = new SimpleRedisClient();