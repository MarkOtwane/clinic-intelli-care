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

  async getPatientDashboardByUserId(userId: string) {
    // Find the patient associated with this user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Auto-provision a basic patient profile if missing so patient dashboards never 404
    if (!user.patientProfile) {
      const created = await this.prisma.patient.create({
        data: {
          user: { connect: { id: user.id } },
          name: user.email?.split('@')[0] || 'New Patient',
          age: 0,
          gender: 'OTHER',
          phone: '',
          address: '',
        },
      });
      return this.getPatientDashboard(created.id);
    }

    return this.getPatientDashboard(user.patientProfile.id);
  }

  async getPatientDashboard(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          include: { Profile: true },
        },
      },
    });

    if (!patient) throw new NotFoundException('Patient not found');

    // Get upcoming appointments
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        patientId,
        date: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      include: {
        doctor: {
          include: {
            user: { include: { Profile: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
      take: 3,
    });

    // Get recent prescriptions (since there's no status field, we'll just get recent ones)
    const recentPrescriptions = await this.prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            user: { include: { Profile: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get recent AI analyses
    const recentAnalyses = await this.prisma.analysis.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // Get unread notifications count
    const unreadNotifications = await this.prisma.notification.count({
      where: {
        userId: patient.user?.id || '',
        isRead: false,
      },
    });

    return {
      patient: {
        id: patient.id,
        firstName:
          patient.user?.Profile?.[0]?.firstName || patient.name.split(' ')[0],
        lastName:
          patient.user?.Profile?.[0]?.lastName ||
          patient.name.split(' ').slice(1).join(' '),
        status: 'active', // Default status since Patient model doesn't have status
      },
      stats: {
        upcomingAppointments: upcomingAppointments.length,
        activePrescriptions: recentPrescriptions.length,
        unreadNotifications,
      },
      upcomingAppointments,
      activePrescriptions: recentPrescriptions,
      recentAnalyses,
    };
  }
}
