import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales-pipeline')
  @RequirePermissions('reports:read')
  getSalesPipeline(@TenantId() tenantId: string) {
    return this.reportsService.getSalesPipeline(tenantId);
  }

  @Get('custom/:id')
  @RequirePermissions('reports:create')
  getCustomReport(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.reportsService.getCustomReport(tenantId, id);
  }
}