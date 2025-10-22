import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { WorkflowEngineService } from './workflow-engine.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkflowsService, WorkflowEngineService],
  controllers: [WorkflowsController],
  exports: [WorkflowEngineService],
})
export class WorkflowsModule {}