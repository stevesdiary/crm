import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, tenantId: string) {
    const secret = crypto.randomBytes(32).toString('hex');
    
    return (this.prisma as any).webhook.create({
      data: {
        ...data,
        tenantId,
        secret,
      },
    });
  }

  async findAll(tenantId: string) {
    return (this.prisma as any).webhook.findMany({
      where: { tenantId },
      include: {
        deliveries: {
          take: 5,
          orderBy: { deliveredAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return (this.prisma as any).webhook.findFirst({
      where: { id, tenantId },
      include: {
        deliveries: {
          orderBy: { deliveredAt: 'desc' },
          take: 50
        }
      }
    });
  }

  async update(id: string, data: any, tenantId: string) {
    return (this.prisma as any).webhook.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    return (this.prisma as any).webhook.deleteMany({
      where: { id, tenantId },
    });
  }

  async triggerWebhooks(event: string, payload: any, tenantId: string) {
    const webhooks = await (this.prisma as any).webhook.findMany({
      where: {
        tenantId,
        isActive: true,
        events: { has: event }
      }
    });

    for (const webhook of webhooks) {
      await this.deliverWebhook(webhook, event, payload);
    }
  }

  private async deliverWebhook(webhook: any, event: string, payload: any) {
    const delivery = await (this.prisma as any).webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        status: 'pending'
      }
    });

    try {
      const signature = this.generateSignature(payload, webhook.secret);
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.text();

      await (this.prisma as any).webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: response.ok ? 'success' : 'failed',
          response: { status: response.status, body: responseData },
          attempts: 1
        }
      });

      await (this.prisma as any).webhook.update({
        where: { id: webhook.id },
        data: { lastTriggered: new Date() }
      });

    } catch (error: any) {
      await (this.prisma as any).webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed',
          response: { error: error.message },
          attempts: 1
        }
      });
    }
  }

  private generateSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  async getAvailableEvents() {
    return [
      { event: 'contact.created', description: 'Contact created' },
      { event: 'contact.updated', description: 'Contact updated' },
      { event: 'lead.created', description: 'Lead created' },
      { event: 'opportunity.created', description: 'Opportunity created' },
      { event: 'task.completed', description: 'Task completed' },
      { event: 'ticket.created', description: 'Ticket created' },
    ];
  }

  async retryDelivery(deliveryId: string, tenantId: string) {
    const delivery = await (this.prisma as any).webhookDelivery.findFirst({
      where: { id: deliveryId },
      include: { webhook: true }
    });

    if (!delivery || delivery.webhook.tenantId !== tenantId) {
      throw new Error('Delivery not found');
    }

    await this.deliverWebhook(delivery.webhook, delivery.event, delivery.payload);
  }
}