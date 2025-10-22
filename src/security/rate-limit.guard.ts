import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || 100;
    const window = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || 60000;

    const key = `${request.ip}:${request.route?.path || request.url}`;
    const now = Date.now();

    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = { count: 1, resetTime: now + window };
      return true;
    }

    if (this.store[key].count >= limit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    this.store[key].count++;
    return true;
  }
}