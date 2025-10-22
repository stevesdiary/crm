import { Controller, Get, Post, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { UserId } from '../common/decorators/user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getNotifications(
      tenantId,
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('unread-count')
  getUnreadCount(@TenantId() tenantId: string, @UserId() userId: string) {
    return this.notificationsService.getUnreadCount(tenantId, userId);
  }

  @Patch(':id/read')
  markAsRead(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(tenantId, userId, notificationId);
  }

  @Post('mark-all-read')
  markAllAsRead(@TenantId() tenantId: string, @UserId() userId: string) {
    return this.notificationsService.markAllAsRead(tenantId, userId);
  }
}