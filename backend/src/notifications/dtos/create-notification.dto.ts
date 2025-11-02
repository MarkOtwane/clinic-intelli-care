import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum NotificationType {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  BOTH = 'BOTH',
}

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;
}
