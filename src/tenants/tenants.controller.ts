import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { TenantsService } from './tenants.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('api/v1/tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post('register')
  register(@Body() registerTenantDto: RegisterTenantDto) {
    return this.tenantsService.register(registerTenantDto);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  findCurrent(@TenantId() tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }

  @Patch('current')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('tenant:update')
  update(@TenantId() tenantId: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(tenantId, updateTenantDto);
  }
}