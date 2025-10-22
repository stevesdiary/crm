import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

interface Notification {
  type: string;
  title: string;
  message: string;
  data?: any;
  userId: string;
  tenantId: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async create(notification: Notification) {
    // Store notification in database (using activities table)
    const activity = await this.prisma.activity.create({
      data: {
        tenantId: notification.tenantId,
        type: 'notification',
        subject: notification.title,
        description: notification.message,
        createdBy: notification.userId,
      }
    });

    // Emit real-time notification
    this.realtimeGateway.emitNotification(
      notification.tenantId,
      notification.userId,
      {
        id: activity.id,
        ...notification,
        createdAt: activity.createdAt,
      }
    );

    return activity;
  }

  async getNotifications(tenantId: string, userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          tenantId,
          createdBy: userId,
          type: 'notification',
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({
        where: {
          tenantId,
          createdBy: userId,
          type: 'notification',
        },
      }),
    ]);

    return {
      data: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnread(userId: string, tenantId: string) {
    return this.prisma.activity.findMany({
      where: {
        tenantId,
        createdBy: userId,
        type: 'notification',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getUnreadCount(tenantId: string, userId: string) {
    return this.prisma.activity.count({
      where: {
        tenantId,
        createdBy: userId,
        type: 'notification',
      },
    });
  }

  async markAsRead(tenantId: string, userId: string, notificationId: string) {
    return this.prisma.activity.updateMany({
      where: { id: notificationId, tenantId, createdBy: userId },
      data: { description: 'read' }
    });
  }

  async markAllAsRead(tenantId: string, userId: string) {
    return this.prisma.activity.updateMany({
      where: {
        tenantId,
        createdBy: userId,
        type: 'notification',
      },
      data: { description: 'read' }
    });
  }
}