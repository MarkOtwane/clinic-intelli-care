import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';

/**
 * Controller for appointment management
 * Handles appointment booking, intelligent routing, and availability checks
 */
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private prisma: PrismaService,
  ) {}

  /**
   * Create appointment with optional intelligent routing (PATIENT only)
   * Can auto-assign doctor based on AI analysis if analysisId provided
   */
  @Post()
  @Roles('PATIENT')
  async createAppointment(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser('id') userId: string,
    @Query('analysisId') analysisId?: string,
  ) {
    // Get patient ID from user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.appointmentsService.createAppointment(
      dto,
      user.patientProfile.id,
      analysisId,
    );
  }

  /**
   * Get suggested doctors based on AI analysis (PATIENT only)
   * Shows recommended doctors before booking
   */
  @Get('suggested-doctors/:analysisId')
  @Roles('PATIENT')
  getSuggestedDoctors(@Param('analysisId') analysisId: string) {
    return this.appointmentsService.getSuggestedDoctors(analysisId);
  }

  /**
   * Get available time slots for a doctor on a specific date
   * Used for appointment booking UI
   */
  @Get('available-slots/:doctorId')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  getAvailableTimeSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    if (!date) {
      throw new BadRequestException('Date query parameter is required');
    }
    return this.appointmentsService.getAvailableTimeSlots(doctorId, date);
  }

  /**
   * Get appointments for current patient (PATIENT only)
   */
  @Get('my-appointments')
  @Roles('PATIENT')
  async getMyAppointments(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.appointmentsService.getAppointmentsByPatient(
      user.patientProfile.id,
    );
  }

  /**
   * Get appointments for current doctor (DOCTOR only)
   */
  @Get('my-doctor-appointments')
  @Roles('DOCTOR')
  async getMyDoctorAppointments(@CurrentUser('id') userId: string) {
    console.log(`Getting doctor appointments for user: ${userId}`);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      console.error(`Doctor profile not found for user: ${userId}`);
      throw new BadRequestException('Doctor profile not found');
    }

    console.log(`Doctor profile found: ${user.doctorProfile.id}`);
    const appointments = await this.appointmentsService.getAppointmentsByDoctor(
      user.doctorProfile.id,
    );
    console.log(`Returning ${appointments.length} appointments`);
    return appointments;
  }

  /**
   * Get available doctors (publicly accessible for booking)
   * IMPORTANT: Must come before @Get(':id') to avoid route conflicts
   */
  @Public()
  @Get('doctors')
  getAvailableDoctors() {
    return this.appointmentsService.getAvailableDoctors();
  }

  /**
   * Get doctor availability (DOCTOR only, own availability)
   */
  @Get('availability')
  @Roles('DOCTOR')
  async getDoctorAvailability(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.appointmentsService.getDoctorAvailability(
      user.doctorProfile.id,
    );
  }

  /**
   * Get patient AI analyses for doctor (DOCTOR only, patients who booked appointments)
   */
  @Get('patient-analyses')
  @Roles('DOCTOR')
  async getPatientAnalysesForDoctor(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.appointmentsService.getPatientAnalysesForDoctor(
      user.doctorProfile.id,
    );
  }

  /**
   * Get all appointments (ADMIN only)
   */
  @Get()
  @Roles('ADMIN')
  getAllAppointments() {
    return this.appointmentsService.getAllAppointments();
  }

  /**
   * Get single appointment by ID
   */
  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  getAppointmentById(@Param('id') id: string) {
    return this.appointmentsService.getAppointmentById(id);
  }

  /**
   * Get appointments for a specific patient (by patient ID)
   */
  @Get('patient/:patientId')
  @Roles('ADMIN', 'DOCTOR')
  getAppointmentsByPatient(@Param('patientId') patientId: string) {
    return this.appointmentsService.getAppointmentsByPatient(patientId);
  }

  /**
   * Get appointments for a specific doctor (by doctor ID)
   */
  @Get('doctor/:doctorId')
  @Roles('ADMIN')
  getAppointmentsByDoctor(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.getAppointmentsByDoctor(doctorId);
  }

  /**
   * Update appointment (DOCTOR, ADMIN only)
   */
  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  updateAppointment(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser('role') role: string,
  ) {
    return this.appointmentsService.updateAppointment(id, dto, role);
  }

  /**
   * Approve appointment (DOCTOR only)
   */
  @Patch(':id/approve')
  @Roles('DOCTOR')
  async approveAppointment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.appointmentsService.approveAppointment(
      id,
      user.doctorProfile.id,
    );
  }

  /**
   * Reject appointment (DOCTOR only)
   */
  @Patch(':id/reject')
  @Roles('DOCTOR')
  async rejectAppointment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { reason?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.appointmentsService.rejectAppointment(
      id,
      user.doctorProfile.id,
      body.reason,
    );
  }

  /**
   * Cancel appointment (PATIENT only, own appointments)
   */
  @Delete(':id')
  @Roles('PATIENT')
  async cancelAppointment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.appointmentsService.cancelAppointment(
      id,
      user.patientProfile.id,
    );
  }
}
