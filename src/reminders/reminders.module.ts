import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}