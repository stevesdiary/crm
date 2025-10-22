import { Controller, Get, Post, Delete, Param, UseGuards, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { GdprService } from './gdpr.service';

@Controller('api/v1/gdpr')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, RateLimitGuard)
export class GdprController {
  constructor(private gdprService: GdprService) {}

  @Get('export/:contactId')
  @Roles('admin')
  @RateLimit(10, 3600000) // 10 exports per hour
  async exportPersonalData(
    @Param('contactId') contactId: string,
    @TenantId() tenantId: string,
    @Request() req,
    @Res() res: Response
  ) {
    const data = await this.gdprService.exportPersonalData(contactId, tenantId, req.user.userId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="personal-data-${contactId}.json"`);
    res.json(data);
  }

  @Post('anonymize/:contactId')
  @Roles('admin')
  @RateLimit(5, 3600000) // 5 anonymizations per hour
  anonymizePersonalData(
    @Param('contactId') contactId: string,
    @TenantId() tenantId: string,
    @Request() req
  ) {
    return this.gdprService.anonymizePersonalData(contactId, tenantId, req.user.userId);
  }

  @Delete('delete/:contactId')
  @Roles('admin')
  @RateLimit(5, 3600000) // 5 deletions per hour
  deletePersonalData(
    @Param('contactId') contactId: string,
    @TenantId() tenantId: string,
    @Request() req
  ) {
    return this.gdprService.deletePersonalData(contactId, tenantId, req.user.userId);
  }
}