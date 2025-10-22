import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const duration = (Date.now() - startTime) / 1000;
          
          this.logger.log(`${method} ${url} ${response.statusCode} - ${duration.toFixed(3)}s - ${ip}`);
          this.metricsService.recordHttpRequest(method, url, response.statusCode, duration);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          this.logger.error(`${method} ${url} ${error.status || 500} - ${duration.toFixed(3)}s - ${ip}`);
          this.metricsService.recordHttpRequest(method, url, error.status || 500, duration);
        },
      }),
    );
  }
}
