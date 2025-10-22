import { IsString, IsOptional, IsJSON } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsJSON()
  settings?: any;
}