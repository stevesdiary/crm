import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class ContactsImportService {
  constructor(
    private prisma: PrismaService,
    private activitiesService: ActivitiesService,
  ) {}

  async importCsv(file: any, tenantId: string, createdBy: string) {
    const csvData = file.buffer.toString();
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const contact = {
          firstName: values[headers.indexOf('firstName')] || '',
          lastName: values[headers.indexOf('lastName')] || '',
          email: values[headers.indexOf('email')] || null,
          phone: values[headers.indexOf('phone')] || null,
          company: values[headers.indexOf('company')] || null,
          tenantId,
          createdBy,
        };
        contacts.push(contact);
      }
    }

    const result = await this.prisma.contact.createMany({
      data: contacts,
      skipDuplicates: true,
    });

    // Log activity
    await this.activitiesService.logActivity(
      'import',
      'Contact Import',
      `Imported ${result.count} contacts from CSV`,
      'system',
      'import',
      tenantId,
      createdBy,
    );

    return { imported: result.count, total: contacts.length };
  }

  async exportCsv(tenantId: string) {
    const contacts = await this.prisma.contact.findMany({
      where: { tenantId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        createdAt: true,
      },
    });

    const headers = ['firstName', 'lastName', 'email', 'phone', 'company', 'createdAt'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(contact => 
        headers.map(header => contact[header] || '').join(',')
      ),
    ].join('\n');

    return csvContent;
  }
}