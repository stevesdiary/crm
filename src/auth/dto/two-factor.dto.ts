import { IsString, IsBoolean } from 'class-validator';

export class EnableTwoFactorDto {
  @IsString()
  secret: string;

  @IsString()
  token: string;
}

export class VerifyTwoFactorDto {
  @IsString()
  token: string;
}

export class LoginWithTwoFactorDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  twoFactorToken: string;
}