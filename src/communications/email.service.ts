import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  async sendEmail(dto: SendEmailDto, tenantId: string, userId: string) {
    try {
      // SendGrid integration would go here
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // await sgMail.send({
      //   to: dto.to,
      //   from: 'noreply@yourcrm.com',
      //   subject: dto.subject,
      //   html: dto.content,
      //   cc: dto.cc,
      //   bcc: dto.bcc
      // });

      // Log communication
      const communication = await this.prisma.conversation.create({
        data: {
          tenantId,
          channel: 'email',
          participants: JSON.stringify([dto.to]),
          messages: JSON.stringify([{
            from: userId,
            to: dto.to,
            subject: dto.subject,
            content: dto.content,
            timestamp: new Date(),
            type: 'email'
          }])
        }
      });

      return { success: true, communicationId: communication.id };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async getEmailHistory(contactId: string, tenantId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        tenantId,
        channel: 'email',
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