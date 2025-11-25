import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { v4 as uuidv4 } from 'uuid';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create a notification
  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        id: uuidv4(),
        title: dto.title,
        message: dto.message,
        userId: dto.userId,
        type: dto.type || 'BOTH',
        scheduledAt: dto.scheduledAt || null,
      },
    });

    // Send immediately if not scheduled
    if (!dto.scheduledAt) {
      await this.deliver(notification);
    }

    return notification;
  }

  // ✅ Deliver (email + in-app)
  async deliver(notification: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: notification.userId },
    });
    if (!user) return;

    if (notification.type === 'EMAIL' || notification.type === 'BOTH') {
      await this.sendEmail(
        user.email,
        notification.title,
        notification.message,
      );
    }

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: { deliveredAt: new Date() },
    });
  }

  private async sendEmail(to: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HMS Notifications" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html: `<h3>${subject}</h3><p>${message}</p>`,
    });
  }

  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
