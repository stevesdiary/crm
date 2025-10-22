import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @MinLength(2)
  tenantName: string;

  @IsString()
  @MinLength(2)
  adminFullName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  plan?: string = 'free';
}