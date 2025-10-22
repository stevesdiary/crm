import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { GmailService } from './gmail.service';
import { OutlookService } from './outlook.service';
import { CalendarService } from './calendar.service';
import { SocialMediaService } from './social-media.service';
import { PaymentService } from './payment.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  controllers: [IntegrationsController],
  providers: [
    SlackService,
    GmailService,
    OutlookService,
    CalendarService,
    SocialMediaService,
    PaymentService
  ],
  exports: [
    SlackService,
    GmailService,
    OutlookService,
    CalendarService,
    SocialMediaService,
    PaymentService
  ]
})
export class IntegrationsModule {}
