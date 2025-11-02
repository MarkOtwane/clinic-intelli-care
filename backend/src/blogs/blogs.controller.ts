import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @Roles('DOCTOR')
  create(@Body() dto: CreateBlogDto, @CurrentUser('id') doctorId: string) {
    return this.blogsService.create(dto, doctorId);
  }

  @Get()
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('DOCTOR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  @Get('doctor/:id')
  @Roles('DOCTOR', 'ADMIN')
  findByDoctor(@Param('id') id: string) {
    return this.blogsService.findByDoctor(id);
  }
}
