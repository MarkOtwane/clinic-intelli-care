import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('PATIENT')
  createAppointment(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser('id') patientId: string,
  ) {
    return this.appointmentsService.createAppointment(dto, patientId);
  }

  @Get()
  @Roles('ADMIN')
  getAllAppointments() {
    return this.appointmentsService.getAllAppointments();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  getAppointmentById(@Param('id') id: string) {
    return this.appointmentsService.getAppointmentById(id);
  }

  @Get('patient/:patientId')
  @Roles('PATIENT')
  getAppointmentsByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.getAppointmentsByPatient(patientId);
  }

  @Get('doctor/:doctorId')
  @Roles('DOCTOR')
  getAppointmentsByDoctor(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.getAppointmentsByDoctor(doctorId);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  updateAppointment(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser('role') role: string,
  ) {
    return this.appointmentsService.updateAppointment(id, dto, role);
  }

  @Delete(':id')
  @Roles('PATIENT')
  cancelAppointment(
    @Param('id') id: string,
    @CurrentUser('id') patientId: string,
  ) {
    return this.appointmentsService.cancelAppointment(id, patientId);
  }
}
