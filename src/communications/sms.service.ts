import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class SmsService {
  constructor(private prisma: PrismaService) {}

  async sendSms(dto: SendSmsDto, tenantId: string, userId: string) {
    try {
      // Twilio integration would go here
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: dto.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: dto.to
      // });

      // Log communication
      const communication = await this.prisma.conversation.create({
        data: {
          tenantId,
          channel: 'sms',
          participants: JSON.stringify([dto.to]),
          messages: JSON.stringify([{
            from: userId,
            to: dto.to,
            content: dto.message,
            timestamp: new Date(),
            type: 'sms'
          }])
        }
      });

      return { success: true, communicationId: communication.id };
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async getSmsHistory(contactId: string, tenantId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        tenantId,
        channel: 'sms',
        participants: {
          path: ['$'],
          string_contains: contactId
        }
      },
      orderBy: { id: 'desc' }
    });

    return conversations.map(conv => ({
      id: conv.id,
      messages: JSON.parse(conv.messages as string),
      participants: JSON.parse(conv.participants as string)
    }));
  }
}