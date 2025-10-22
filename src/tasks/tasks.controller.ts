import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantId } from '../common/decorators/tenant.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('api/v1/tasks')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @TenantId() tenantId: string, @Request() req) {
    return this.tasksService.create(createTaskDto, tenantId, req.user.userId);
  }

  @Get()
  @Roles('admin', 'user', 'sales', 'support')
  findAll(@TenantId() tenantId: string, @Query() query: { assignedTo?: string; status?: string }) {
    return this.tasksService.findAll(tenantId, query);
  }

  @Get('activities')
  getActivities(@TenantId() tenantId: string, @Query() query: { entityType?: string; entityId?: string }) {
    return this.tasksService.getActivities(tenantId, query.entityType, query.entityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.tasksService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @TenantId() tenantId: string, @Request() req) {
    return this.tasksService.update(id, updateTaskDto, tenantId, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.tasksService.remove(id, tenantId);
  }
}