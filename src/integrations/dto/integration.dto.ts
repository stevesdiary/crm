import { IsString, IsEmail, IsNumber, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @IsString()
  accessToken: string;

  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;
}

export class CreateCalendarEventDto {
  @IsString()
  accessToken: string;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsOptional()
  @IsArray()
  attendees?: string[];
}

export class CreatePaymentIntentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SocialMediaPostDto {
  @IsString()
  accessToken: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  pageId?: string;
}
