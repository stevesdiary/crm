import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIntegrationDto {
  @ApiProperty({ example: 'slack', enum: ['gmail', 'outlook', 'google_calendar', 'slack', 'zapier'] })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'My Slack Integration' })
  @IsString()
  name: string;

  @ApiProperty({ example: { webhookUrl: 'https://hooks.slack.com/...' } })
  @IsObject()
  config: Record<string, any>;

  @ApiProperty({ example: { apiKey: 'secret' } })
  @IsObject()
  credentials: Record<string, any>;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
