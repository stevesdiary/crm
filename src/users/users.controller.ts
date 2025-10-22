import { Controller, Get, Patch, Param, Delete, Body, UseGuards, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  findAll(@TenantId() tenantId: string) {
    return this.usersService.findAll(tenantId);
  }

  @Post()
  @RequirePermissions('users:create')
  create(@Body() createUserDto: CreateUserDto, @TenantId() tenantId: string) {
    return this.usersService.create(createUserDto, tenantId);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @TenantId() tenantId: string) {
    return this.usersService.update(id, updateUserDto, tenantId);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.usersService.remove(id, tenantId);
  }

  @Get('roles/available')
  @RequirePermissions('users:read')
  getAvailableRoles(@TenantId() tenantId: string) {
    return this.usersService.getAvailableRoles(tenantId);
  }
}