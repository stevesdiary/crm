import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { TicketsService } from './tickets.service';

@Controller('api/v1/tickets')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: any, @TenantId() tenantId: string) {
    return this.ticketsService.create(createTicketDto, tenantId);
  }

  @Get()
  @Roles('admin', 'user', 'support')
  findAll(@TenantId() tenantId: string, @Query() query: { priority?: string; status?: string; contactId?: string }) {
    return this.ticketsService.findAll(tenantId, query);
  }

  @Get('sla/metrics')
  @Roles('admin', 'support')
  getSlaMetrics(@TenantId() tenantId: string) {
    return this.ticketsService.getSlaMetrics(tenantId);
  }

  @Post('sla/policy')
  @Roles('admin')
  createSlaPolicy(@Body() data: any, @TenantId() tenantId: string) {
    return this.ticketsService.createSlaPolicy(data, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ticketsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: any, @TenantId() tenantId: string, @Request() req) {
    return this.ticketsService.update(id, updateTicketDto, tenantId, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.ticketsService.remove(id, tenantId);
  }
}