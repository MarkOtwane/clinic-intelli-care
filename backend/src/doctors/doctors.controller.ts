import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @Roles('ADMIN')
  createDoctor(
    @Body() dto: CreateDoctorDto,
    @CurrentUser('id') userId: string,
  ) {
    // Admins create doctor users after user signup
    return this.doctorsService.createDoctor(dto, userId);
  }

  @Get()
  @Roles('ADMIN', 'PATIENT')
  getAllDoctors() {
    return this.doctorsService.getAllDoctors();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  getDoctorById(@Param('id') id: string) {
    return this.doctorsService.getDoctorById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR')
  updateDoctor(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorDto,
    @CurrentUser() user,
  ) {
    return this.doctorsService.updateDoctor(
      id,
      dto,
      user.id,
      user.role === 'ADMIN',
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteDoctor(@Param('id') id: string) {
    return this.doctorsService.deleteDoctor(id);
  }
}
