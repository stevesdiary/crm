import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    return this.prisma.$transaction(async (tx) => {
      const slaPolicy = await tx.slaPolicy.findFirst({
        where: { tenantId, priority: data.priority }
      });

      const dueAt = slaPolicy ? 
        new Date(Date.now() + slaPolicy.resolutionTime * 60000) : null;

      const ticket = await tx.ticket.create({
        data: { ...data, tenantId, dueAt },
        include: { contact: true, slaPolicy: true }
      });

      await tx.activity.create({
        data: {
          tenantId,
          type: 'ticket_created',
          subject: `Ticket created: ${ticket.subject}`,
          description: `Priority: ${ticket.priority}`,
          relatedEntityType: 'ticket',
          relatedEntityId: ticket.id,
          createdBy: ticket.contactId
        }
      });

      return ticket;
    });
  }

  async findAll(tenantId: string, filters?: { priority?: string; status?: string; contactId?: string }) {
    return this.prisma.ticket.findMany({
      where: {
        tenantId,
        ...(filters?.priority && { priority: filters.priority }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.contactId && { contactId: filters.contactId })
      },
      include: { contact: true, assignee: true, slaPolicy: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.ticket.findFirst({
      where: { id, tenantId },
      include: { contact: true, assignee: true, slaPolicy: true }
    });
  }

  async update(id: string, data: any, tenantId: string, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const updateData = { ...data };
      
      if (data.status === 'resolved' && !data.resolvedAt) {
        updateData.resolvedAt = new Date();
        const ticket = await tx.ticket.findFirst({ where: { id, tenantId } });
        if (ticket) {
          updateData.resolutionTime = Math.floor(
            (new Date().getTime() - ticket.createdAt.getTime()) / 60000
          );
        }
      }

      if (data.assignedTo && !data.firstResponseAt) {
        updateData.firstResponseAt = new Date();
        const ticket = await tx.ticket.findFirst({ where: { id, tenantId } });
        if (ticket) {
          updateData.responseTime = Math.floor(
            (new Date().getTime() - ticket.createdAt.getTime()) / 60000
          );
        }
      }

      const ticket = await tx.ticket.update({
        where: { id },
        data: updateData,
        include: { slaPolicy: true }
      });

      // Check SLA breach
      if (ticket.slaPolicy && ticket.dueAt && new Date() > ticket.dueAt) {
        await tx.ticket.update({
          where: { id },
          data: { slaBreached: true }
        });
      }

      return ticket;
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.ticket.deleteMany({
      where: { id, tenantId }
    });
  }

  async getSlaMetrics(tenantId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { tenantId },
      include: { slaPolicy: true }
    });

    const total = tickets.length;
    const breached = tickets.filter(t => t.slaBreached).length;
    const avgResponseTime = tickets
      .filter(t => t.responseTime)
      .reduce((sum, t) => sum + (t.responseTime || 0), 0) / 
      tickets.filter(t => t.responseTime).length || 0;
    
    return {
      total,
      breached,
      breachRate: total > 0 ? (breached / total) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }

  async createSlaPolicy(data: any, tenantId: string) {
    return this.prisma.slaPolicy.create({
      data: { ...data, tenantId }
    });
  }

  async getSlaPolicy(tenantId: string, priority: string) {
    return this.prisma.slaPolicy.findFirst({
      where: { tenantId, priority }
    });
  }
}