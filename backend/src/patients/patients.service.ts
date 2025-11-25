import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { UpdatePatientDto } from './dtos/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async createPatient(dto: CreatePatientDto, userId: string) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });
  }

  async getAllPatients() {
    return this.prisma.patient.findMany({
      include: { user: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPatientById(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async updatePatient(
    id: string,
    dto: UpdatePatientDto,
    currentUserId: string,
    isAdmin: boolean,
  ) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) throw new NotFoundException('Patient not found');
    if (!isAdmin && patient.user?.id !== currentUserId)
      throw new ForbiddenException('You can only update your own profile');

    return this.prisma.patient.update({
      where: { id },
      data: dto,
    });
  }

  async deletePatient(id: string) {
    await this.prisma.patient.delete({ where: { id } });
    return { message: 'Patient deleted successfully' };
  }
}
