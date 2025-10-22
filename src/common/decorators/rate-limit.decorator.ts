import { SetMetadata } from '@nestjs/common';

export const RateLimit = (limit: number, window: number = 60) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('rateLimit', limit)(target, propertyKey, descriptor);
    SetMetadata('rateLimitWindow', window)(target, propertyKey, descriptor);
  };
};
