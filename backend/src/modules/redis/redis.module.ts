import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisHealthService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
          password: process.env.REDIS_PASSWORD || 'your_redis_password',
        }),
      }),
    }),
  ],
  providers: [RedisHealthService],
  exports: [CacheModule, RedisHealthService],
})
export class RedisCacheModule {}
