import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { CallsService } from './calls.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { LogCallDto } from './dto/log-call.dto';

@Controller('api/v1/communications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CommunicationsController {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private callsService: CallsService,
  ) {}

  @Post('email/send')
  @RequirePermissions('contacts:update')
  sendEmail(@Body() sendEmailDto: SendEmailDto, @Request() req: any) {
    return this.emailService.sendEmail(sendEmailDto, req.user.tenantId, req.user.sub);
  }

  @Get('email/history/:contactId')
  @RequirePermissions('contacts:read')
  getEmailHistory(@Param('contactId') contactId: string, @Request() req: any) {
    return this.emailService.getEmailHistory(contactId, req.user.tenantId);
  }

  @Post('sms/send')
  @RequirePermissions('contacts:update')
  sendSms(@Body() sendSmsDto: SendSmsDto, @Request() req: any) {
    return this.smsService.sendSms(sendSmsDto, req.user.tenantId, req.user.sub);
  }

  @Get('sms/history/:contactId')
  @RequirePermissions('contacts:read')
  getSmsHistory(@Param('contactId') contactId: string, @Request() req: any) {
    return this.smsService.getSmsHistory(contactId, req.user.tenantId);
  }

  @Post('calls/log')
  @RequirePermissions('contacts:update')
  logCall(@Body() logCallDto: LogCallDto, @Request() req: any) {
    return this.callsService.logCall(logCallDto, req.user.tenantId, req.user.sub);
  }

  @Get('calls/history/:contactId')
  @RequirePermissions('contacts:read')
  getCallHistory(@Param('contactId') contactId: string, @Request() req: any) {
    return this.callsService.getCallHistory(contactId, req.user.tenantId);
  }

  @Get('calls/stats')
  @RequirePermissions('reports:read')
  getCallStats(@Request() req: any) {
    return this.callsService.getCallStats(req.user.tenantId);
  }
}