import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GmailService } from './gmail.service';
import { OutlookService } from './outlook.service';
import { CalendarService } from './calendar.service';
import { SocialMediaService } from './social-media.service';
import { PaymentService } from './payment.service';

@Controller('api/v1/integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(
    private gmailService: GmailService,
    private outlookService: OutlookService,
    private calendarService: CalendarService,
    private socialMediaService: SocialMediaService,
    private paymentService: PaymentService
  ) {}

  @Post('gmail/send')
  async sendGmail(@Body() body: { accessToken: string; to: string; subject: string; body: string }) {
    return this.gmailService.sendEmail(body.accessToken, body.to, body.subject, body.body);
  }

  @Get('gmail/emails')
  async getGmailEmails(@Query('accessToken') accessToken: string, @Query('maxResults') maxResults?: string) {
    return this.gmailService.getEmails(accessToken, maxResults ? parseInt(maxResults) : 10);
  }

  @Post('outlook/send')
  async sendOutlook(@Body() body: { accessToken: string; to: string; subject: string; body: string }) {
    return this.outlookService.sendEmail(body.accessToken, body.to, body.subject, body.body);
  }

  @Get('outlook/emails')
  async getOutlookEmails(@Query('accessToken') accessToken: string, @Query('top') top?: string) {
    return this.outlookService.getEmails(accessToken, top ? parseInt(top) : 10);
  }

  @Post('calendar/google/event')
  async createGoogleEvent(@Body() body: any) {
    return this.calendarService.createGoogleEvent(body.accessToken, body.event);
  }

  @Post('calendar/outlook/event')
  async createOutlookEvent(@Body() body: any) {
    return this.calendarService.createOutlookEvent(body.accessToken, body.event);
  }

  @Post('social/linkedin')
  async postLinkedIn(@Body() body: { accessToken: string; text: string }) {
    return this.socialMediaService.postToLinkedIn(body.accessToken, body.text);
  }

  @Post('social/twitter')
  async postTwitter(@Body() body: { accessToken: string; text: string }) {
    return this.socialMediaService.postToTwitter(body.accessToken, body.text);
  }

  @Post('social/facebook')
  async postFacebook(@Body() body: { accessToken: string; pageId: string; message: string }) {
    return this.socialMediaService.postToFacebook(body.accessToken, body.pageId, body.message);
  }

  @Post('payment/intent')
  async createPaymentIntent(@Body() body: any) {
    return this.paymentService.createPaymentIntent(body);
  }

  @Post('payment/customer')
  async createCustomer(@Body() body: { email: string; name: string }) {
    return this.paymentService.createCustomer(body.email, body.name);
  }

  @Post('payment/subscription')
  async createSubscription(@Body() body: { customerId: string; priceId: string }) {
    return this.paymentService.createSubscription(body.customerId, body.priceId);
  }

  @Get('payment/status')
  async getPaymentStatus(@Query('paymentIntentId') paymentIntentId: string) {
    return this.paymentService.getPaymentStatus(paymentIntentId);
  }
}
