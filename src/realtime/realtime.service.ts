import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class RealtimeService {
  constructor(private websocketGateway: WebSocketGateway) {}

  notifyContactUpdate(tenantId: string, contactId: string, data: any) {
    this.websocketGateway.sendUpdate(tenantId, `contact:${contactId}`, {
      type: 'contact_updated',
      contactId,
      data,
    });
  }

  notifyTaskUpdate(tenantId: string, taskId: string, data: any) {
    this.websocketGateway.sendUpdate(tenantId, `task:${taskId}`, {
      type: 'task_updated',
      taskId,
      data,
    });
  }

  notifyTicketUpdate(tenantId: string, ticketId: string, data: any) {
    this.websocketGateway.sendUpdate(tenantId, `ticket:${ticketId}`, {
      type: 'ticket_updated',
      ticketId,
      data,
    });
  }

  notifyOpportunityUpdate(tenantId: string, opportunityId: string, data: any) {
    this.websocketGateway.sendUpdate(tenantId, `opportunity:${opportunityId}`, {
      type: 'opportunity_updated',
      opportunityId,
      data,
    });
  }

  notifyDashboardUpdate(tenantId: string, data: any) {
    this.websocketGateway.sendUpdate(tenantId, 'dashboard', {
      type: 'dashboard_updated',
      data,
    });
  }

  notifyActivityUpdate(tenantId: string, data: any) {
    this.websocketGateway.sendUpdate(tenantId, 'activity', {
      type: 'activity_created',
      data,
    });
  }
}