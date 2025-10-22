import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  async sendEmail(data: {
    contactId: string;
    subject: string;
    content: string;
    tenantId: string;
    userId: string;
  }) {
    // Simulate email sending
    console.log(`Sending email to contact ${data.contactId}: ${data.subject}`);
    
    return this.prisma.communication.create({
      data: {
        tenantId: data.tenantId,
        contactId: data.contactId,
        userId: data.userId,
        type: 'email',
        direction: 'outbound',
        subject: data.subject,
        content: data.content,
        status: 'sent'
      },
      include: { contact: true, user: true }
    });
  }

  async sendSMS(data: {
    contactId: string;
    content: string;
    tenantId: string;
    userId: string;
  }) {
    // Simulate SMS sending
    console.log(`Sending SMS to contact ${data.contactId}: ${data.content}`);
    
    return this.prisma.communication.create({
      data: {
        tenantId: data.tenantId,
        contactId: data.contactId,
        userId: data.userId,
        type: 'sms',
        direction: 'outbound',
        content: data.content,
        status: 'sent'
      },
      include: { contact: true, user: true }
    });
  }

  async logCall(data: {
    contactId: string;
    duration: number;
    direction: 'inbound' | 'outbound';
    notes?: string;
    tenantId: string;
    userId: string;
  }) {
    return this.prisma.communication.create({
      data: {
        tenantId: data.tenantId,
        contactId: data.contactId,
        userId: data.userId,
        type: 'call',
        direction: data.direction,
        duration: data.duration,
        content: data.notes,
        status: 'completed'
      },
      include: { contact: true, user: true }
    });
  }

  async getCommunicationHistory(contactId: string, tenantId: string) {
    return this.prisma.communication.findMany({
      where: { contactId, tenantId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllCommunications(tenantId: string, filters?: {
    type?: string;
    contactId?: string;
    userId?: string;
  }) {
    return this.prisma.communication.findMany({
      where: {
        tenantId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.contactId && { contactId: filters.contactId }),
        ...(filters?.userId && { userId: filters.userId })
      },
      include: {
        contact: { select: { firstName: true, lastName: true, email: true } },
        user: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async getCommunicationStats(tenantId: string) {
    const [totalComms, emailCount, smsCount, callCount] = await Promise.all([
      this.prisma.communication.count({ where: { tenantId } }),
      this.prisma.communication.count({ where: { tenantId, type: 'email' } }),
      this.prisma.communication.count({ where: { tenantId, type: 'sms' } }),
      this.prisma.communication.count({ where: { tenantId, type: 'call' } })
    ]);

    const avgCallDuration = await this.prisma.communication.aggregate({
      where: { tenantId, type: 'call', duration: { not: null } },
      _avg: { duration: true }
    });

    return {
      total: totalComms,
      emails: emailCount,
      sms: smsCount,
      calls: callCount,
      avgCallDuration: Math.round(avgCallDuration._avg.duration || 0)
    };
  }
}