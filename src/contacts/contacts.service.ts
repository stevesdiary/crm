import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { WorkflowEngineService } from '../workflows/workflow-engine.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { AuditService } from '../audit/audit.service';
import { RealtimeService } from '../realtime/realtime.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactsService {
  constructor(
    private prisma: PrismaService,
    private workflowEngine: WorkflowEngineService,
    private webhooksService: WebhooksService,
    private auditService: AuditService,
    private realtimeService: RealtimeService,
    private notificationsService: NotificationsService
  ) {}

  async create(data: CreateContactDto, tenantId: string, createdBy: string) {
    const contact = await this.prisma.contact.create({
      data: { 
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
        customFields: data.customFields,
        tenant: { connect: { id: tenantId } },
        creator: { connect: { id: createdBy } }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        email: true,
        phone: true,
        address: true,
        customFields: true,
        createdAt: true,
        createdBy: true
      }
    });

    // Trigger workflows
    await this.workflowEngine.triggerWorkflows(
      'contact_created',
      'contact',
      contact,
      tenantId
    );

    // Trigger webhooks
    await this.webhooksService.triggerWebhooks(
      'contact.created',
      contact,
      tenantId
    );

    // Log audit trail
    await this.auditService.logAction(
      tenantId,
      createdBy,
      'create',
      'contact',
      { contactId: contact.id, contactEmail: contact.email }
    );

    // Send real-time update
    this.realtimeService.notifyContactUpdate(tenantId, contact.id, contact);

    return contact;
  }

  async findAll(tenantId: string, query: any = {}) {
    const { page = 1, limit = 10, search, company } = query;
    const skip = (page - 1) * limit;
    
    const where: any = { tenantId };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (company) where.company = { contains: company, mode: 'insensitive' };
    
    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);
    
    return {
      data: contacts,
      meta: { total, page: parseInt(page), limit: parseInt(limit) },
    };
  }

  async findOne(id: string, tenantId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        leads: { select: { id: true, status: true, source: true } },
        opportunities: { select: { id: true, name: true, amount: true, stage: true } },
        tickets: { select: { id: true, subject: true, status: true } }
      }
    });
    
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    
    return contact;
  }

  async update(id: string, data: UpdateContactDto, tenantId: string) {
    const result = await this.prisma.contact.updateMany({
      where: { id, tenantId },
      data,
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Contact not found');
    }

    const updatedContact = await this.findOne(id, tenantId);

    // Log audit trail
    await this.auditService.logAction(
      tenantId,
      'system', // Would be actual user ID in real implementation
      'update',
      'contact',
      { contactId: id, updatedFields: Object.keys(data) }
    );

    // Send real-time update
    this.realtimeService.notifyContactUpdate(tenantId, id, updatedContact);
    
    return updatedContact;
  }

  async remove(id: string, tenantId: string) {
    const result = await this.prisma.contact.deleteMany({
      where: { id, tenantId },
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Contact not found');
    }

    // Log audit trail
    await this.auditService.logAction(
      tenantId,
      'system', // Would be actual user ID in real implementation
      'delete',
      'contact',
      { contactId: id }
    );
    
    return { message: 'Contact deleted successfully' };
  }
}