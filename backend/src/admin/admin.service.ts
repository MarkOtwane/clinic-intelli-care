import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ManageRoleDto } from './dto/manage-role.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // --- USERS MANAGEMENT ---

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { doctor: true, patient: true },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { doctor: true, patient: true },
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
      include: { doctor: true, comments: true },
    });
  }

  async getAllComments() {
    return this.prisma.comment.findMany({
      include: { user: true, blog: true },
    });
  }
}
