/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, password: string, role: string) {
    return this.prisma.user.create({
      data: { email, password, role: role as any },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
