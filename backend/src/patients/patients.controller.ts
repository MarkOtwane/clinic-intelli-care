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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('ADMIN', 'PATIENT')
  createPatient(
    @Body() dto: CreatePatientDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.patientsService.createPatient(dto, userId);
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR')
  getAllPatients() {
    return this.patientsService.getAllPatients();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  getPatientById(@Param('id') id: string) {
    return this.patientsService.getPatientById(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PATIENT')
  updatePatient(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user,
  ) {
    return this.patientsService.updatePatient(
      id,
      dto,
      user.id,
      user.role === 'ADMIN',
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  deletePatient(@Param('id') id: string) {
    return this.patientsService.deletePatient(id);
  }
}
