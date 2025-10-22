import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { WebhooksService } from './webhooks.service';

@Controller('api/v1/webhooks')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Get('events')
  @Roles('admin', 'user')
  getAvailableEvents() {
    return this.webhooksService.getAvailableEvents();
  }

  @Post()
  @Roles('admin')
  create(@Body() createWebhookDto: any, @TenantId() tenantId: string) {
    return this.webhooksService.create(createWebhookDto, tenantId);
  }

  @Get()
  @Roles('admin', 'user')
  findAll(@TenantId() tenantId: string) {
    return this.webhooksService.findAll(tenantId);
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.webhooksService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateWebhookDto: any, @TenantId() tenantId: string) {
    return this.webhooksService.update(id, updateWebhookDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.webhooksService.remove(id, tenantId);
  }

  @Post('deliveries/:id/retry')
  @Roles('admin')
  retryDelivery(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.webhooksService.retryDelivery(id, tenantId);
  }
}