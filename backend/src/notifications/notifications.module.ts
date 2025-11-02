import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [NotificationsService, SchedulerService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
