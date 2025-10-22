import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateShareDto {
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(2592000) // 30 days
  expiresIn?: number = 86400; // 24 hours default
}
