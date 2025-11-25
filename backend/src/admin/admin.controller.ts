import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { ManageRoleDto } from './dto/manage-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // --- USERS ---
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // --- ROLES ---
  @Patch('assign-role')
  assignRole(@Body() dto: ManageRoleDto) {
    return this.adminService.assignRole(dto);
  }

  // --- ENTITIES ---
  @Get('appointments')
  getAppointments() {
    return this.adminService.getAllAppointments();
  }

  @Get('prescriptions')
  getPrescriptions() {
    return this.adminService.getAllPrescriptions();
  }

  @Get('blogs')
  getBlogs() {
    return this.adminService.getAllBlogs();
  }

  @Get('comments')
  getComments() {
    return this.adminService.getAllComments();
  }
}
