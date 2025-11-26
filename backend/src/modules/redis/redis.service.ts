import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisHealthService implements OnModuleInit {
  private readonly logger = new Logger(RedisHealthService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit() {
    try {
      const testKey = '__redis_health_check__';
      await this.cacheManager.set(testKey, 'abc', 100); // TTL 5s
      const result = await this.cacheManager.get(testKey);
      if (result === 'abc') {
        this.logger.log('✅ Redis connected successfully');
      } else {
        throw new Error('Redis set/get test failed');
      }
    } catch (error) {
      this.logger.error('❌ Redis connection failed', error);
    }
  }

  async setData(key: string, value: any, ttl?: number) {
    await this.cacheManager.set(key, value, ttl);
  }

  async getData<T>(key: string): Promise<T> {
    return (await this.cacheManager.get(key)) as T;
  }
}
