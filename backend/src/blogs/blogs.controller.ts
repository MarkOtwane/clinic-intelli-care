import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

  private async getDoctorProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { doctorProfile: true },
    });

    if (!user || !user.doctorProfile) {
      throw new BadRequestException('Doctor profile not found');
    }

    return user.doctorProfile;
  }

  /**
   * Create a new blog post (DOCTOR only)
   */
  @Post()
  @Roles('DOCTOR')
  async create(@Body() dto: CreateBlogDto, @CurrentUser('id') userId: string) {
    const doctor = await this.getDoctorProfile(userId);
    return this.blogsService.create(dto, doctor.id);
  }

  @Get()
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  findAll() {
    return this.blogsService.findAll();
  }

  /**
   * Get blogs by current doctor (DOCTOR only)
   */
  @Get('my-blogs')
  @Roles('DOCTOR')
  async findMyBlogs(@CurrentUser('id') userId: string) {
    const doctor = await this.getDoctorProfile(userId);
    return this.blogsService.findByDoctor(doctor.id);
  }

  /**
   * Get blogs by specific doctor ID
   */
  @Get('doctor/:id')
  @Roles('DOCTOR', 'ADMIN')
  findByDoctor(@Param('id') id: string) {
    return this.blogsService.findByDoctor(id);
  }

  @Get(':id')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const post = await this.blogsService.findOne(id);
    if (post.published) {
      return post;
    }

    if (!user) {
      throw new ForbiddenException('You cannot access this blog post');
    }

    if (user.role === 'ADMIN') {
      return post;
    }

    if (user.role === 'DOCTOR') {
      const doctor = await this.getDoctorProfile(user.id);
      if (post.authorId === doctor.id) {
        return post;
      }
    }

    throw new ForbiddenException('You cannot access this blog post');
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: any,
  ) {
    if (user.role === 'ADMIN') {
      return this.blogsService.update(id, dto);
    }

    const doctor = await this.getDoctorProfile(user.id);
    return this.blogsService.updateAsDoctor(id, dto, doctor.id);
  }

  @Delete(':id')
  @Roles('DOCTOR', 'ADMIN')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role === 'ADMIN') {
      return this.blogsService.remove(id);
    }

    const doctor = await this.getDoctorProfile(user.id);
    return this.blogsService.removeAsDoctor(id, doctor.id);
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
