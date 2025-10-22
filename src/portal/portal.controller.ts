import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TicketsService } from '../tickets/tickets.service';
import { PrismaService } from '../common/prisma/prisma.service';

@Controller('api/v1/portal')
export class PortalController {
  constructor(
    private ticketsService: TicketsService,
    private prisma: PrismaService
  ) {}

  @Get('tickets')
  async getCustomerTickets(@Query('email') email: string) {
    const contact = await (this.prisma as any).contact.findFirst({
      where: { email }
    });
    
    if (!contact) return [];
    
    return this.ticketsService.findAll(contact.tenantId, { contactId: contact.id });
  }

  @Post('tickets')
  async createTicket(@Body() data: { email: string; subject: string; description: string; priority?: string }) {
    const contact = await (this.prisma as any).contact.findFirst({
      where: { email: data.email }
    });
    
    if (!contact) {
      throw new Error('Contact not found');
    }

    return this.ticketsService.create({
      contactId: contact.id,
      subject: data.subject,
      description: data.description,
      priority: data.priority || 'medium',
      status: 'open'
    }, contact.tenantId);
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string, @Query('email') email: string) {
    const contact = await (this.prisma as any).contact.findFirst({
      where: { email }
    });
    
    if (!contact) return null;
    
    return this.ticketsService.findOne(id, contact.tenantId);
  }
}