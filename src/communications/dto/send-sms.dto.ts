import { IsString, IsOptional } from 'class-validator';

export class SendSmsDto {
  @IsString()
  to: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  contactId?: string;
}