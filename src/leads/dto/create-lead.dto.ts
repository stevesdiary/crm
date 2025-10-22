import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateLeadDto {
  @IsOptional()
  @IsString()
  contactId?: string;

  @IsString()
  source: string;

  @IsString()
  status: string = 'new';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}