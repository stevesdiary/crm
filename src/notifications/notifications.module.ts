import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { WebSocketModule } from '../websocket/websocket.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, WebSocketModule, RealtimeModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}