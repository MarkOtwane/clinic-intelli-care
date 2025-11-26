import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('ADMIN', 'DOCTOR')
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get('user')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  findByUser(@CurrentUser('id') userId: string) {
    return this.notificationsService.findByUser(userId);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId/unread-count')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
