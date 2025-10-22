import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { LeadsModule } from './leads/leads.module';
// import { OpportunitiesModule } from './opportunities/opportunities.module';
import { TasksModule } from './tasks/tasks.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { ReportsModule } from './reports/reports.module';
import { ActivitiesModule } from './activities/activities.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { RemindersModule } from './reminders/reminders.module';
import { PortalModule } from './portal/portal.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CommunicationsModule } from './communications/communications.module';
import { FilesModule } from './files/files.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { DocsController } from './docs/docs.controller';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { GdprModule } from './gdpr/gdpr.module';
import { WebSocketModule } from './websocket/websocket.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MetricsModule } from './metrics/metrics.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MetricsModule,
    AuthModule,
    ContactsModule,
    LeadsModule,
    // OpportunitiesModule,
    TasksModule,
    TicketsModule,
    UsersModule,
    TenantsModule,
    ReportsModule,
    ActivitiesModule,
    WorkflowsModule,
    RemindersModule,
    PortalModule,
    AnalyticsModule,
    CommunicationsModule,
    FilesModule,
    WebhooksModule,
    IntegrationsModule,
    HealthModule,
    AuditModule,
    GdprModule,
    WebSocketModule,
    NotificationsModule,
    RealtimeModule,
  ],
  controllers: [DocsController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}