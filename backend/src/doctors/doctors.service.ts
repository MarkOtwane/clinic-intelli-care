import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async createDoctor(dto: CreateDoctorDto, userId: string) {
    return this.prisma.doctor.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
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

  async deleteDoctor(id: string) {
    await this.prisma.doctor.delete({ where: { id } });
    return { message: 'Doctor deleted successfully' };
  }
}
