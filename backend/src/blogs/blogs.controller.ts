import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Controller('blogs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private prisma: PrismaService,
  ) {}

  /**
   * Create a new blog post (DOCTOR only)
   */
  @Post()
  @Roles('DOCTOR')
  async create(@Body() dto: CreateBlogDto, @CurrentUser('id') userId: string) {
    // Get doctor ID from user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.blogsService.create(dto, user.doctorProfile.id);
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

  /**
   * Get blogs by specific doctor ID
   */
  @Get('doctor/:id')
  @Roles('DOCTOR', 'ADMIN')
  findByDoctor(@Param('id') id: string) {
    return this.blogsService.findByDoctor(id);
  }

  /**
   * Get blogs by current doctor (DOCTOR only)
   */
  @Get('my-blogs')
  @Roles('DOCTOR')
  async findMyBlogs(@CurrentUser('id') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return this.blogsService.findByDoctor(user.doctorProfile.id);
  }

  /**
   * Like a blog post (PATIENT, DOCTOR, ADMIN)
   */
  @Post(':id/like')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  like(@Param('id') id: string) {
    return this.blogsService.toggleLike(id, true);
  }

  /**
   * Unlike a blog post (PATIENT, DOCTOR, ADMIN)
   */
  @Post(':id/unlike')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  unlike(@Param('id') id: string) {
    return this.blogsService.toggleLike(id, false);
  }
}
