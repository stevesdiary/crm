import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { TenantId } from '../common/decorators/tenant.decorator';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@Controller('api/v1/workflows')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get('triggers')
  @RequirePermissions('workflows:read')
  getAvailableTriggers() {
    return this.workflowsService.getAvailableTriggers();
  }

  @Get('actions')
  @RequirePermissions('workflows:read')
  getAvailableActions() {
    return this.workflowsService.getAvailableActions();
  }

  @Post()
  @RequirePermissions('workflows:create')
  create(@Body() createWorkflowDto: CreateWorkflowDto, @TenantId() tenantId: string) {
    return this.workflowsService.create(createWorkflowDto, tenantId);
  }

  @Get()
  @RequirePermissions('workflows:read')
  findAll(@TenantId() tenantId: string) {
    return this.workflowsService.findAll(tenantId);
  }

  @Get(':id')
  @RequirePermissions('workflows:read')
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.workflowsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions('workflows:update')
  update(@Param('id') id: string, @Body() updateWorkflowDto: CreateWorkflowDto, @TenantId() tenantId: string) {
    return this.workflowsService.update(id, updateWorkflowDto, tenantId);
  }

  @Post(':id/toggle')
  @RequirePermissions('workflows:update')
  toggleWorkflow(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.workflowsService.toggleWorkflow(id, tenantId);
  }

  @Post(':id/test')
  @RequirePermissions('workflows:update')
  testWorkflow(@Param('id') id: string, @Body() testData: any, @TenantId() tenantId: string) {
    return this.workflowsService.testWorkflow(id, testData, tenantId);
  }

  @Delete(':id')
  @RequirePermissions('workflows:delete')
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.workflowsService.remove(id, tenantId);
  }

  @Get(':id/executions')
  @RequirePermissions('workflows:read')
  getExecutions(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.workflowsService.getExecutions(id, tenantId);
  }
}