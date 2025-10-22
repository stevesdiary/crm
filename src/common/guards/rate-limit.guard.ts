import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: any;

  constructor(private reflector: Reflector) {
    // this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = `rate-limit:${request.ip}:${request.path}`;
    
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || 100;
    const window = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || 60;

    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, window);
    }

    if (current > limit) {
      throw new HttpException(
        { message: 'Rate limit exceeded', retryAfter: await this.redis.ttl(key) },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }
}
