import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorAccountDto } from './dtos/create-doctor-account.dto';
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

    const doctor = await this.prisma.doctor.create({
      data: {
        ...doctorData,
        ...(userConnect ? { user: userConnect } : {}),
      },
    });

    return doctor;
  }

  async createDoctorAccount(dto: CreateDoctorAccountDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        role: 'DOCTOR',
        mustChangePassword: true,
      },
    });

    const doctor = await this.prisma.doctor.create({
      data: {
        name: dto.name,
        specialization: dto.specialization,
        phone: dto.phone,
        bio: dto.bio,
        experience: dto.experience,
        available: true,
        userId: user.id,
      },
    });

    return {
      ...doctor,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async getAllDoctors() {
    return this.prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            mustChangePassword: true,
          },
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

  async getDoctorDashboard(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    // Get upcoming appointments
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'PENDING'] },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    // Get recent appointments (completed/in past)
    const recentAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        date: { lt: new Date() },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            phone: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });

    // Get total appointments count
    const totalAppointments = await this.prisma.appointment.count({
      where: { doctorId },
    });

    // Get total prescriptions issued
    const totalPrescriptions = await this.prisma.prescription.count({
      where: { doctorId },
    });

    // Get total patients seen
    const totalPatients = await this.prisma.appointment.findMany({
      where: { doctorId },
      distinct: ['patientId'],
      select: { patientId: true },
    });

    // Get pending appointments count
    const pendingAppointments = await this.prisma.appointment.count({
      where: {
        doctorId,
        status: 'PENDING',
      },
    });

    return {
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        phone: doctor.phone,
        bio: doctor.bio,
        experience: doctor.experience,
        available: doctor.available,
      },
      stats: {
        totalAppointments,
        totalPrescriptions,
        totalPatients: totalPatients.length,
        pendingAppointments,
        upcomingAppointmentsCount: upcomingAppointments.length,
      },
      upcomingAppointments,
      recentAppointments,
    };
  }

  async getDoctorDashboardByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.getDoctorDashboard(user.doctorProfile.id);
  }
}
