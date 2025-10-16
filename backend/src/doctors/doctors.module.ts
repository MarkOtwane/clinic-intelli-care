import { Module } from '@nestjs/common';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';

@Module({
  controllers: [DoctorsController],
  providers: [DoctorsService]
})
export class DoctorsModule {}
