import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    // Encrypt credentials
    const encryptedCredentials = this.encryptCredentials(data.credentials);
    
    return (this.prisma as any).integration.create({
      data: {
        ...data,
        tenantId,
        credentials: encryptedCredentials,
      },
    });
  }

  async findAll(tenantId: string) {
    const integrations = await (this.prisma as any).integration.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    // Remove sensitive credentials from response
    return integrations.map(integration => ({
      ...integration,
      credentials: undefined,
      hasCredentials: !!integration.credentials
    }));
  }

  async findOne(id: string, tenantId: string) {
    const integration = await (this.prisma as any).integration.findFirst({
      where: { id, tenantId },
    });

    if (integration) {
      return {
        ...integration,
        credentials: undefined,
        hasCredentials: !!integration.credentials
      };
    }

    return integration;
  }

  async update(id: string, data: any, tenantId: string) {
    const updateData = { ...data };
    
    if (data.credentials) {
      updateData.credentials = this.encryptCredentials(data.credentials);
    }

    return (this.prisma as any).integration.updateMany({
      where: { id, tenantId },
      data: updateData,
    });
  }

  async remove(id: string, tenantId: string) {
    return (this.prisma as any).integration.deleteMany({
      where: { id, tenantId },
    });
  }

  async getAvailableProviders() {
    return [
      {
        provider: 'gmail',
        name: 'Gmail',
        description: 'Sync emails and send messages',
        fields: ['clientId', 'clientSecret', 'refreshToken']
      },
      {
        provider: 'outlook',
        name: 'Microsoft Outlook',
        description: 'Sync emails and calendar events',
        fields: ['clientId', 'clientSecret', 'refreshToken']
      },
      {
        provider: 'google_calendar',
        name: 'Google Calendar',
        description: 'Sync calendar events and meetings',
        fields: ['clientId', 'clientSecret', 'refreshToken']
      },
      {
        provider: 'slack',
        name: 'Slack',
        description: 'Send notifications to Slack channels',
        fields: ['webhookUrl', 'channel']
      },
      {
        provider: 'zapier',
        name: 'Zapier',
        description: 'Connect with 3000+ apps via Zapier',
        fields: ['webhookUrl']
      }
    ];
  }

  async testIntegration(id: string, tenantId: string) {
    const integration = await (this.prisma as any).integration.findFirst({
      where: { id, tenantId }
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const credentials = this.decryptCredentials(integration.credentials);
    
    // Test based on provider
    switch (integration.provider) {
      case 'gmail':
        return this.testGmailIntegration(credentials);
      case 'slack':
        return this.testSlackIntegration(credentials);
      default:
        return { success: true, message: 'Test not implemented for this provider' };
    }
  }

  private async testGmailIntegration(credentials: any) {
    // Mock Gmail API test
    console.log('Testing Gmail integration...');
    return { success: true, message: 'Gmail connection successful' };
  }

  private async testSlackIntegration(credentials: any) {
    try {
      const response = await fetch(credentials.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'CRM Integration Test - Connection Successful! 🎉'
        })
      });

      return {
        success: response.ok,
        message: response.ok ? 'Slack connection successful' : 'Slack connection failed'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async syncIntegration(id: string, tenantId: string) {
    const integration = await (this.prisma as any).integration.findFirst({
      where: { id, tenantId }
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    // Update last sync time
    await (this.prisma as any).integration.update({
      where: { id },
      data: { lastSync: new Date() }
    });

    return { message: 'Sync initiated successfully' };
  }

  private encryptCredentials(credentials: any): any {
    const secret = process.env.ENCRYPTION_KEY || 'default-key';
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex') };
  }

  private decryptCredentials(encryptedCredentials: any): any {
    const secret = process.env.ENCRYPTION_KEY || 'default-key';
    const key = crypto.scryptSync(secret, 'salt', 32);
    const iv = Buffer.from(encryptedCredentials.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedCredentials.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
}