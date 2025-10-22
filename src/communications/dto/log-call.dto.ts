import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class LogCallDto {
  @IsString()
  contactId: string;

  @IsString()
  direction: 'inbound' | 'outbound';

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  outcome?: string;
}