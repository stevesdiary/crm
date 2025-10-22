import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string, createdBy: string) {
    return this.prisma.activity.create({
      data: { ...data, tenantId, createdBy },
    });
  }

  async findAll(tenantId: string, relatedEntityId?: string) {
    const where: any = { tenantId };
    if (relatedEntityId) {
      where.relatedEntityId = relatedEntityId;
    }

    return this.prisma.activity.findMany({
      where,
      include: { creator: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async logActivity(
    type: string,
    subject: string,
    description: string,
    relatedEntityType: string,
    relatedEntityId: string,
    tenantId: string,
    createdBy: string,
  ) {
    return this.create(
      {
        type,
        subject,
        description,
        relatedEntityType,
        relatedEntityId,
      },
      tenantId,
      createdBy,
    );
  }
}