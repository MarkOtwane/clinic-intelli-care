import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dtos/create-prescription.dto';
import { UpdatePrescriptionDto } from './dtos/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto, doctorId: string) {
    if (!dto.appointmentId) {
      throw new BadRequestException('Appointment ID is required');
    }

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
      select: {
        id: true,
        doctorId: true,
        patientId: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new ForbiddenException(
        'You can only create prescriptions for your own appointments',
      );
    }

    if (dto.patientId && dto.patientId !== appointment.patientId) {
      throw new BadRequestException(
        'Patient ID does not match the selected appointment',
      );
    }

    return this.prisma.prescription.create({
      data: {
        patientId: appointment.patientId,
        doctorId,
        appointmentId: appointment.id,
        analysisId: dto.analysisId,
        medications: dto.medications,
        notes: dto.notes,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async findAll() {
    return this.prisma.prescription.findMany({
      include: { patient: true, doctor: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.prescription.findMany({
      where: { patientId },
      include: { doctor: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async update(id: string, dto: UpdatePrescriptionDto) {
    return this.prisma.prescription.update({
      where: { id },
      data: { ...dto },
      include: { patient: true, doctor: true },
    });
  }

  async remove(id: string) {
    return this.prisma.prescription.delete({
      where: { id },
    });
  }
}
