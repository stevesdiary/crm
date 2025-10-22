import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { AuditService } from './audit.service';

@Controller('api/v1/audit')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, RateLimitGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  @Roles('admin')
  @RateLimit(100, 60000) // 100 requests per minute
  getLogs(@TenantId() tenantId: string, @Query() query: any) {
    return this.auditService.getLogs(tenantId, query);
  }

  @Get('export')
  @Roles('admin')
  @RateLimit(5, 60000) // 5 exports per minute
  async exportLogs(
    @TenantId() tenantId: string,
    @Query() query: any,
    @Res() res: Response
  ) {
    const csv = await this.auditService.exportLogs(tenantId, query);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  }

  @Get('stats')
  @Roles('admin')
  @RateLimit(60, 60000) // 60 requests per minute
  getStats(@TenantId() tenantId: string) {
    return this.auditService.getStats(tenantId);
  }
}