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
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('me')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  getProfile(@CurrentUser() user) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  updateMyProfile(@CurrentUser() user, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(user.id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
