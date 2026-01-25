import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { UpdateDoctorDto } from './dtos/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async createDoctor(dto: CreateDoctorDto) {
    let userConnect:
      | {
          connect: {
            id: string;
          };
        }
      | undefined;

    if (dto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });

      if (!user) throw new NotFoundException('User not found');

      // Ensure the linked user has the DOCTOR role
      if (user.role !== 'DOCTOR') {
        await this.prisma.user.update({
          where: { id: dto.userId },
          data: { role: 'DOCTOR' },
        });
      }

      userConnect = { connect: { id: dto.userId } };
    }

    const { userId, ...doctorData } = dto;

    return this.prisma.doctor.create({
      data: {
        ...doctorData,
        ...(userConnect ? { user: userConnect } : {}),
      },
    });
  }

  async getAllDoctors() {
    return this.prisma.doctor.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDoctorById(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async updateDoctor(
    id: string,
    dto: UpdateDoctorDto,
    currentUserId: string,
    isAdmin: boolean,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!isAdmin && doctor.userId !== currentUserId)
      throw new ForbiddenException('You can only update your own profile');

    return this.prisma.doctor.update({
      where: { id },
      data: dto,
    });
  }

  async setAvailability(id: string, available: boolean) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.doctor.update({
      where: { id },
      data: { available },
    });
  }

  async deleteDoctor(id: string) {
    await this.prisma.doctor.delete({ where: { id } });
    return { message: 'Doctor deleted successfully' };
  }
}
