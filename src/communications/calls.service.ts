import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { LogCallDto } from './dto/log-call.dto';

@Injectable()
export class CallsService {
  constructor(private prisma: PrismaService) {}

  async logCall(dto: LogCallDto, tenantId: string, userId: string) {
    const communication = await this.prisma.conversation.create({
      data: {
        tenantId,
        channel: 'call',
        participants: JSON.stringify([dto.contactId]),
        messages: JSON.stringify([{
          userId,
          contactId: dto.contactId,
          direction: dto.direction,
          duration: dto.duration,
          notes: dto.notes,
          outcome: dto.outcome,
          timestamp: new Date(),
          type: 'call'
        }])
      }
    });

    return { success: true, callId: communication.id };
  }

  async getCallHistory(contactId: string, tenantId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        tenantId,
        channel: 'call',
        participants: {
          path: ['$'],
          string_contains: contactId
        }
      },
      orderBy: { id: 'desc' }
    });

    return conversations.map(conv => ({
      id: conv.id,
      call: JSON.parse(conv.messages as string)[0],
      participants: JSON.parse(conv.participants as string)
    }));
  }

  async getCallStats(tenantId: string) {
    const calls = await this.prisma.conversation.findMany({
      where: { tenantId, channel: 'call' }
    });

    const callData = calls.map(call => JSON.parse(call.messages as string)[0]);
    
    return {
      totalCalls: calls.length,
      inboundCalls: callData.filter(call => call.direction === 'inbound').length,
      outboundCalls: callData.filter(call => call.direction === 'outbound').length,
      averageDuration: callData.reduce((sum, call) => sum + (call.duration || 0), 0) / calls.length || 0
    };
  }
}