import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

interface WorkflowTrigger {
  event: string;
  entity: string;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

interface WorkflowAction {
  type: 'create_task' | 'send_email' | 'update_field' | 'call_webhook';
  params: any;
}

@Injectable()
export class WorkflowEngineService {
  constructor(private prisma: PrismaService) {}

  async triggerWorkflows(event: string, entity: string, entityData: any, tenantId: string) {
    const workflows = await this.prisma.workflow.findMany({
      where: {
        tenantId,
        isActive: true,
        trigger: {
          path: ['event'],
          equals: event,
        },
      },
    });

    for (const workflow of workflows) {
      if (this.evaluateConditions(workflow.conditions as unknown as WorkflowCondition[], entityData)) {
        await this.executeWorkflow(workflow, entityData, tenantId);
      }
    }
  }

  private evaluateConditions(conditions: WorkflowCondition[], entityData: any): boolean {
    return conditions.every(condition => {
      const fieldValue = entityData[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(condition.value);
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  private async executeWorkflow(workflow: any, entityData: any, tenantId: string) {
    const execution = await this.prisma.workflowExecution.create({
      data: {
        tenantId,
        workflowId: workflow.id,
        entityType: workflow.trigger.entity,
        entityId: entityData.id,
        status: 'pending',
      },
    });

    try {
      const actions = workflow.actions as WorkflowAction[];
      const results = [];

      for (const action of actions) {
        const result = await this.executeAction(action, entityData, tenantId);
        results.push(result);
      }

      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          result: results,
        },
      });
    } catch (error) {
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          error: error.message,
        },
      });
    }
  }

  private async executeAction(action: WorkflowAction, entityData: any, tenantId: string) {
    switch (action.type) {
      case 'create_task':
        return this.prisma.task.create({
          data: {
            tenantId,
            type: 'task',
            subject: action.params.subject || 'Automated Task',
            assignedTo: action.params.assignedTo,
            relatedEntityType: entityData.constructor.name.toLowerCase(),
            relatedEntityId: entityData.id,
            notes: action.params.notes,
            dueAt: action.params.dueAt ? new Date(action.params.dueAt) : null,
          },
        });

      case 'send_email':
        // Implement email sending logic
        return { type: 'email', status: 'sent', to: action.params.to };

      case 'update_field':
        // Implement field update logic
        return { type: 'update', field: action.params.field, value: action.params.value };

      case 'call_webhook':
        // Implement webhook call logic
        return { type: 'webhook', url: action.params.url, status: 'called' };

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}