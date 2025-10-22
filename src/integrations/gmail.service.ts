import { Injectable } from '@nestjs/common';

@Injectable()
export class GmailService {
  private async gmailRequest(accessToken: string, endpoint: string, method = 'GET', body?: any) {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`);
    }

    return response.json();
  }

  async sendEmail(accessToken: string, to: string, subject: string, body: string) {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await this.gmailRequest(accessToken, '/users/me/messages/send', 'POST', {
      raw: encodedMessage
    });

    return { messageId: res.id };
  }

  async getEmails(accessToken: string, maxResults = 10) {
    const res = await this.gmailRequest(accessToken, `/users/me/messages?maxResults=${maxResults}`);
    return res.messages || [];
  }

  async getEmailDetails(accessToken: string, messageId: string) {
    return this.gmailRequest(accessToken, `/users/me/messages/${messageId}`);
  }
}
