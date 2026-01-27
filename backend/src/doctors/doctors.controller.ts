import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DoctorsService } from './doctors.service';
import { CreateDoctorAccountDto } from './dtos/create-doctor-account.dto';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { UpdateDoctorStatusDto } from './dtos/update-doctor-status.dto';
import { UpdateDoctorDto } from './dtos/update-doctor.dto';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post('account')
  @Roles('ADMIN')
  createDoctorAccount(@Body() dto: CreateDoctorAccountDto) {
    return this.doctorsService.createDoctorAccount(dto);
  }

  @Post()
  @Roles('ADMIN')
  createDoctor(@Body() dto: CreateDoctorDto) {
    // Admins can create doctor profiles and link them to a user account via userId
    return this.doctorsService.createDoctor(dto);
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

  @Patch(':id/status')
  @Roles('ADMIN')
  setDoctorStatus(@Param('id') id: string, @Body() dto: UpdateDoctorStatusDto) {
    return this.doctorsService.setAvailability(id, dto.available);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteDoctor(@Param('id') id: string) {
    return this.doctorsService.deleteDoctor(id);
  }

  @Get('dashboard')
  @Roles('DOCTOR')
  getDashboard(@CurrentUser('id') userId: string) {
    // Find the doctor associated with this user
    return this.doctorsService.getDoctorDashboardByUserId(userId);
  }
}
