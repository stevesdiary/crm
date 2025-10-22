import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class ConvertLeadDto {
  @IsString()
  opportunityName: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsString()
  stage: string = 'prospecting';

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;
}