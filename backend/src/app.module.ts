import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CommentsModule } from './comments/comments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PatientsModule } from './patients/patients.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { PrismaModule } from './prisma/prisma.module';
import { SymptomsModule } from './symptoms/symptoms.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    SymptomsModule,
    AiAnalysisModule,
    AppointmentsModule,
    PrescriptionsModule,
    BlogsModule,
    CommentsModule,
    MediaModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
