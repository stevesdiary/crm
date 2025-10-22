import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body } = request;

    return next.handle().pipe(
      tap(async () => {
        if (user?.tenantId && user?.userId) {
          await this.prisma.auditLog.create({
            data: {
              tenantId: user.tenantId,
              actorId: user.userId,
              action: method,
              target: url,
              details: { body },
            },
          });
        }
      }),
    );
  }
}