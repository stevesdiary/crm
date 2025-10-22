import { Injectable } from '@nestjs/common';

@Injectable()
export class OutlookService {
  private async graphRequest(accessToken: string, endpoint: string, method = 'GET', body?: any) {
    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.statusText}`);
    }

    return method === 'POST' && response.status === 202 ? { success: true } : response.json();
  }

  async sendEmail(accessToken: string, to: string, subject: string, body: string) {
    const message = {
      message: {
        subject,
        body: { contentType: 'HTML', content: body },
        toRecipients: [{ emailAddress: { address: to } }]
      }
    };

    await this.graphRequest(accessToken, '/me/sendMail', 'POST', message);
    return { success: true };
  }

  async getEmails(accessToken: string, top = 10) {
    const res = await this.graphRequest(accessToken, `/me/messages?$top=${top}`);
    return res.value;
  }

  async getEmailDetails(accessToken: string, messageId: string) {
    return this.graphRequest(accessToken, `/me/messages/${messageId}`);
  }

  async createDraft(accessToken: string, to: string, subject: string, body: string) {
    const draft = {
      subject,
      body: { contentType: 'HTML', content: body },
      toRecipients: [{ emailAddress: { address: to } }]
    };

    return this.graphRequest(accessToken, '/me/messages', 'POST', draft);
  }
}
