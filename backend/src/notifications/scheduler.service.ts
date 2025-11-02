import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Runs every hour to send due notifications
  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledNotifications() {
    const now = new Date();
    const dueNotifications = await this.prisma.notification.findMany({
      where: {
        scheduledAt: { lte: now },
        deliveredAt: null,
      },
    });

    for (const notification of dueNotifications) {
      await this.notificationsService.deliver(notification);
      this.logger.log(
        `Delivered scheduled notification: ${notification.title}`,
      );
    }
  }
}
