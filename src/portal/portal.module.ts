import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [TicketsModule, PrismaModule],
  controllers: [PortalController],
})
export class PortalModule {}