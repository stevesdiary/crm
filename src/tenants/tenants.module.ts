import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PermissionsService } from '../permissions/permissions.service';

@Module({
  providers: [TenantsService, PermissionsService],
  controllers: [TenantsController],
})
export class TenantsModule {}