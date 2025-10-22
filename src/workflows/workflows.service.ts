import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private workflowEngine: WorkflowEngineService
  ) {}

  async create(data: CreateWorkflowDto, tenantId: string) {
    return this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        conditions: {},
        actions: data.actions,
        isActive: data.isActive ?? true,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.workflow.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
    });
    
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }
    
    return workflow;
  }

  async update(id: string, data: CreateWorkflowDto, tenantId: string) {
    const result = await this.prisma.workflow.updateMany({
      where: { id, tenantId },
      data: {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        actions: data.actions,
        isActive: data.isActive,
      },
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Workflow not found');
    }
    
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    const result = await this.prisma.workflow.deleteMany({
      where: { id, tenantId },
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Workflow not found');
    }
    
    return { message: 'Workflow deleted successfully' };
  }

  async getExecutions(workflowId: string, tenantId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { workflowId, tenantId },
      orderBy: { executedAt: 'desc' },
      take: 50,
    });
  }

  async getAvailableTriggers() {
    return [
      { event: 'contact_created', entity: 'contact', label: 'Contact Created' },
      { event: 'lead_created', entity: 'lead', label: 'Lead Created' },
      { event: 'opportunity_created', entity: 'opportunity', label: 'Opportunity Created' },
      { event: 'ticket_created', entity: 'ticket', label: 'Ticket Created' },
      { event: 'task_completed', entity: 'task', label: 'Task Completed' },
    ];
  }

  async getAvailableActions() {
    return [
      { type: 'create_task', label: 'Create Task', params: ['subject', 'assignedTo', 'dueAt'] },
      { type: 'send_email', label: 'Send Email', params: ['to', 'subject', 'content'] },
      { type: 'send_sms', label: 'Send SMS', params: ['to', 'message'] },
      { type: 'update_field', label: 'Update Field', params: ['field', 'value'] },
      { type: 'call_webhook', label: 'Call Webhook', params: ['url', 'method'] },
      { type: 'create_ticket', label: 'Create Ticket', params: ['subject', 'description', 'priority'] },
      { type: 'update_lead_score', label: 'Update Lead Score', params: ['score'] },
    ];
  }

  async testWorkflow(workflowId: string, testData: any, tenantId: string) {
    const workflow = await this.findOne(workflowId, tenantId);
    if (!workflow) throw new Error('Workflow not found');

    return this.workflowEngine.triggerWorkflows(
      (workflow.trigger as any).event,
      (workflow.trigger as any).entity,
      testData,
      tenantId
    );
  }

  async toggleWorkflow(id: string, tenantId: string) {
    const workflow = await this.findOne(id, tenantId);
    const result = await this.prisma.workflow.updateMany({
      where: { id, tenantId },
      data: { isActive: !workflow.isActive }
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Workflow not found');
    }
    
    return this.findOne(id, tenantId);
  }
}