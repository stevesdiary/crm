import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class GdprService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  async exportPersonalData(contactId: string, tenantId: string, userId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, tenantId },
      include: {
        leads: true,
        opportunities: true,
        tickets: true,
        communications: true,
      }
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    await this.auditService.logAction(
      tenantId,
      userId,
      'gdpr_export',
      'contact',
      { contactId, exportedAt: new Date() }
    );

    return {
      personalData: {
        contact: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          address: contact.address,
          customFields: contact.customFields,
          createdAt: contact.createdAt,
        },
        leads: contact.leads.map(lead => ({
          id: lead.id,
          source: lead.source,
          status: lead.status,
          score: lead.score,
          createdAt: lead.createdAt,
        })),
        opportunities: contact.opportunities.map(opp => ({
          id: opp.id,
          name: opp.name,
          amount: opp.amount,
          stage: opp.stage,
          expectedCloseDate: opp.expectedCloseDate,
          createdAt: opp.createdAt,
        })),
        tickets: contact.tickets.map(ticket => ({
          id: ticket.id,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: ticket.createdAt,
        })),
        communications: contact.communications.map(comm => ({
          id: comm.id,
          type: comm.type,
          direction: comm.direction,
          subject: comm.subject,
          content: comm.content,
          createdAt: comm.createdAt,
        })),
      },
      exportedAt: new Date().toISOString(),
      dataRetentionPolicy: 'Data is retained for 7 years from last interaction or as required by law.',
    };
  }

  async anonymizePersonalData(contactId: string, tenantId: string, userId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, tenantId }
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    const anonymizedData = {
      firstName: 'ANONYMIZED',
      lastName: 'USER',
      email: `anonymized-${contactId}@example.com`,
      phone: null,
      address: null,
      customFields: {},
    };

    await this.prisma.contact.update({
      where: { id: contactId },
      data: anonymizedData
    });

    await this.prisma.communication.updateMany({
      where: { contactId },
      data: {
        content: 'CONTENT ANONYMIZED',
        subject: 'SUBJECT ANONYMIZED'
      }
    });

    await this.auditService.logAction(
      tenantId,
      userId,
      'gdpr_anonymize',
      'contact',
      { contactId, anonymizedAt: new Date() }
    );

    return { message: 'Personal data has been anonymized successfully' };
  }

  async deletePersonalData(contactId: string, tenantId: string, userId: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, tenantId }
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    await this.auditService.logAction(
      tenantId,
      userId,
      'gdpr_delete',
      'contact',
      { 
        contactId, 
        contactEmail: contact.email,
        deletedAt: new Date() 
      }
    );

    await this.prisma.contact.delete({
      where: { id: contactId }
    });

    return { message: 'Personal data has been deleted successfully' };
  }
}