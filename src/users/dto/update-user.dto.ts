import { IsEmail, IsString, MinLength, IsOptional, IsJSON } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsJSON()
  prefs?: any;
}