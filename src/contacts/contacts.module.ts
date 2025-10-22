import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { ContactsImportService } from './contacts-import.service';
import { ActivitiesModule } from '../activities/activities.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { AuditModule } from '../audit/audit.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ActivitiesModule, WorkflowsModule, WebhooksModule, AuditModule, RealtimeModule, NotificationsModule],
  providers: [ContactsService, ContactsImportService],
  controllers: [ContactsController],
})
export class ContactsModule {}