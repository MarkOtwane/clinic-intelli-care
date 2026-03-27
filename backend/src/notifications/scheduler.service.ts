import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private toUTC(date: Date): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds(),
      ),
    );
  }

  private toUtcIsoOffset(date: Date): string {
    return this.toUTC(date).toISOString().replace('Z', '+00:00');
  }

  // Runs every hour to send due notifications
  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledNotifications() {
    const nowUtc = this.toUTC(new Date());
    this.logger.log(
      `Processing scheduled notifications at UTC: ${this.toUtcIsoOffset(nowUtc)}`,
    );

    const dueNotifications = await this.prisma.notification.findMany({
      where: {
        scheduledAt: { lte: nowUtc },
        deliveredAt: null,
      },
    });

    this.logger.log(
      `Found ${dueNotifications.length} due notifications up to UTC ${this.toUtcIsoOffset(nowUtc)}`,
    );

    for (const notification of dueNotifications) {
      await this.notificationsService.deliver(notification);
      this.logger.log(
        `Delivered scheduled notification: ${notification.title} | scheduledAt=${this.toUtcIsoOffset(notification.scheduledAt)} | deliveredAt=${this.toUtcIsoOffset(new Date())}`,
      );
    }
  }
}
