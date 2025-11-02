import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto, patientId: string) {
    return this.prisma.appointment.create({
      data: {
        date: new Date(dto.date),
        time: dto.time,
        notes: dto.notes,
        patient: { connect: { id: patientId } },
        doctor: { connect: { id: dto.doctorId } },
      },
      include: {
        doctor: { select: { name: true, specialization: true } },
        patient: { select: { name: true } },
      },
    });
  }

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: { doctor: true, patient: true },
      orderBy: { date: 'desc' },
    });
  }

  async getAppointmentById(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async getAppointmentsByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: true },
    });
  }

  async getAppointmentsByDoctor(doctorId: string) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: { patient: true },
    });
  }

  async updateAppointment(
    id: string,
    dto: UpdateAppointmentDto,
    userRole: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (userRole !== 'DOCTOR' && userRole !== 'ADMIN')
      throw new ForbiddenException(
        'Only doctors or admins can update appointment status',
      );

    return this.prisma.appointment.update({
      where: { id },
      data: dto,
    });
  }

  async cancelAppointment(id: string, patientId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.patientId !== patientId)
      throw new ForbiddenException('You can only cancel your own appointment');

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
