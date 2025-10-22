import { Injectable } from '@nestjs/common';

interface SlackMessage {
  text?: string;
  blocks?: any[];
  channel?: string;
}

@Injectable()
export class SlackService {
  async sendMessage(webhookUrl: string, message: SlackMessage) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return { success: true };
  }

  async notifyNewLead(webhookUrl: string, lead: any) {
    return this.sendMessage(webhookUrl, {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🎯 New Lead Created' }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Source:*\n${lead.source}` },
            { type: 'mrkdwn', text: `*Status:*\n${lead.status}` },
            { type: 'mrkdwn', text: `*Score:*\n${lead.score || 'N/A'}` },
          ]
        }
      ]
    });
  }

  async notifyTicketCreated(webhookUrl: string, ticket: any) {
    return this.sendMessage(webhookUrl, {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🎫 New Support Ticket' }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Subject:*\n${ticket.subject}` },
            { type: 'mrkdwn', text: `*Priority:*\n${ticket.priority}` },
          ]
        }
      ]
    });
  }
}
