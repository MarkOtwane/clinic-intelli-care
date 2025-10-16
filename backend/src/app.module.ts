import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { BlogsModule } from './blogs/blogs.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, PatientsModule, DoctorsModule, AiAnalysisModule, BlogsModule, MediaModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
