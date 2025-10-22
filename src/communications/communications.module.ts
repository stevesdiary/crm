import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { CallsService } from './calls.service';

@Module({
  controllers: [CommunicationsController],
  providers: [EmailService, SmsService, CallsService],
  exports: [EmailService, SmsService, CallsService],
})
export class CommunicationsModule {}