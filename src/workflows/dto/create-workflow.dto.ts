import { IsString, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  trigger: {
    event: string;
    entity: string;
    conditions?: any[];
  };

  @IsArray()
  actions: Array<{
    type: string;
    params: Record<string, any>;
  }>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}