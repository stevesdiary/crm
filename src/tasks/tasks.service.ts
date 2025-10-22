import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTaskDto, tenantId: string, assignedBy: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      const task = await tx.task.create({
        data: {
          ...data,
          tenantId,
          assignedBy,
          status: data.status || 'pending',
          priority: data.priority || 'medium',
        },
        include: { assignee: true, assigner: true },
      });

      // Create reminders if provided
      if (data.reminders?.length) {
        await tx.reminder.createMany({
          data: data.reminders.map((reminder: any) => ({
            tenantId,
            taskId: task.id,
            userId: task.assignedTo,
            type: reminder.type,
            time: reminder.time,
          })),
        });
      }

      // Log activity
      await tx.activity.create({
        data: {
          tenantId,
          type: 'task_assigned',
          subject: `Task assigned: ${task.subject}`,
          description: `Task "${task.subject}" assigned to ${task.assignee.fullName}`,
          relatedEntityType: 'task',
          relatedEntityId: task.id,
          createdBy: assignedBy,
        },
      });

      return task;
    });
  }

  async findAll(tenantId: string, filters?: { assignedTo?: string; status?: string }) {
    return (this.prisma as any).task.findMany({
      where: {
        tenantId,
        ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        assigner: { select: { id: true, fullName: true } },
        reminders: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return (this.prisma as any).task.findFirst({
      where: { id, tenantId },
      include: {
        assignee: { select: { id: true, fullName: true, email: true } },
        assigner: { select: { id: true, fullName: true } },
        reminders: true,
      },
    });
  }

  async update(id: string, data: UpdateTaskDto, tenantId: string, userId: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      const task = await tx.task.update({
        where: { id },
        data,
        include: { assignee: true },
      });

      // Log activity for status changes
      if (data.status) {
        await tx.activity.create({
          data: {
            tenantId,
            type: 'task_updated',
            subject: `Task status changed: ${task.subject}`,
            description: `Task "${task.subject}" status changed to ${data.status}`,
            relatedEntityType: 'task',
            relatedEntityId: task.id,
            createdBy: userId,
          },
        });
      }

      return task;
    });
  }

  async remove(id: string, tenantId: string) {
    return (this.prisma as any).task.deleteMany({
      where: { id, tenantId },
    });
  }

  async getActivities(tenantId: string, entityType?: string, entityId?: string) {
    return (this.prisma as any).activity.findMany({
      where: {
        tenantId,
        ...(entityType && { relatedEntityType: entityType }),
        ...(entityId && { relatedEntityId: entityId }),
      },
      include: {
        creator: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getPendingReminders() {
    return (this.prisma as any).reminder.findMany({
      where: {
        sent: false,
        time: { lte: new Date() },
      },
      include: {
        task: { include: { assignee: true } },
        user: true,
      },
    });
  }

  async markReminderSent(id: string) {
    return (this.prisma as any).reminder.update({
      where: { id },
      data: { sent: true },
    });
  }
}