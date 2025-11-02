import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto, doctorId: string) {
    return this.prisma.prescription.create({
      data: {
        patientId: dto.patientId,
        doctorId,
        appointmentId: dto.appointmentId,
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
