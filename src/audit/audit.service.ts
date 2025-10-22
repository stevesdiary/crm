import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    tenantId: string,
    actorId: string,
    action: string,
    target: string,
    details?: any
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId,
        action,
        target,
        details,
      },
    });
  }

  async getLogs(tenantId: string, filters?: {
    action?: string;
    target?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    
    if (filters?.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }
    
    if (filters?.target) {
      where.target = { contains: filters.target, mode: 'insensitive' };
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.timestamp.lte = new Date(filters.endDate + 'T23:59:59.999Z');
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async exportLogs(tenantId: string, filters?: {
    action?: string;
    target?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { tenantId };
    
    if (filters?.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }
    
    if (filters?.target) {
      where.target = { contains: filters.target, mode: 'insensitive' };
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.timestamp.lte = new Date(filters.endDate + 'T23:59:59.999Z');
      }
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 10000, // Limit export to 10k records
    });

    // Convert to CSV format
    const headers = ['Timestamp', 'User', 'Email', 'Action', 'Target', 'Details'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp.toISOString(),
        `"${log.actor.fullName}"`,
        log.actor.email,
        log.action,
        log.target,
        `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  async getStats(tenantId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalLogs, recentLogs, actionStats] = await Promise.all([
      this.prisma.auditLog.count({ where: { tenantId } }),
      this.prisma.auditLog.count({
        where: {
          tenantId,
          timestamp: { gte: thirtyDaysAgo }
        }
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          tenantId,
          timestamp: { gte: thirtyDaysAgo }
        },
        _count: true
      })
    ]);

    return {
      totalLogs,
      recentLogs,
      actionStats: actionStats.reduce((acc, stat) => {
        acc[stat.action] = stat._count;
        return acc;
      }, {})
    };
  }
}