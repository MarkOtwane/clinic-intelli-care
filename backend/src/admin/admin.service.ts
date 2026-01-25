import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManageRoleDto } from './dto/manage-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAppointments,
      totalAnalyses,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.doctor.count(),
      this.prisma.patient.count(),
      this.prisma.appointment.count(),
      this.prisma.analysis.count(),
    ]);

    // Get recent activity (last 10 records)
    const recentAppointments = await this.prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { patient: true, doctor: true },
    });

    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentActivity = [
      ...recentAppointments.map((apt) => ({
        type: 'appointment_created' as const,
        title: 'Appointment Created',
        description: `${apt.patient?.name || 'Patient'} booked with ${apt.doctor?.name || 'Doctor'}`,
        timestamp: apt.createdAt,
        userId: apt.patientId,
      })),
      ...recentUsers.map((user) => ({
        type: 'user_registered' as const,
        title: 'User Registered',
        description: `${user.email} registered as ${user.role}`,
        timestamp: user.createdAt,
        userId: user.id,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    // Pending approvals
    const pendingDoctors = await this.prisma.doctor.count({
      where: { available: false },
    });

    return {
      systemStats: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalAnalyses,
      },
      recentActivity,
      pendingApprovals: {
        doctors: pendingDoctors,
        content: 0,
        reports: 0,
      },
      systemHealth: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 78,
        activeConnections: 12,
      },
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { doctorProfile: true, patientProfile: true },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { doctorProfile: true, patientProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // --- ROLE MANAGEMENT ---

  async assignRole(dto: ManageRoleDto) {
    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: dto.role },
    });
  }

  // --- ENTITY MANAGEMENT ---

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: { doctor: true, patient: true },
    });
  }

  async getAllPrescriptions() {
    return this.prisma.prescription.findMany({
      include: { doctor: true, patient: true, appointment: true },
    });
  }

  async getAllBlogs() {
    return this.prisma.blogPost.findMany({
      include: { author: true, comments: true },
    });
  }

  async getAllComments() {
    return this.prisma.comment.findMany({
      include: { author: true, blogPost: true },
    });
  }
}
