import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles('PATIENT')
  async create(
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    // Get the patient profile for this user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    });

    if (!user || !user.patientProfile) {
      throw new BadRequestException('Patient profile not found');
    }

    return this.commentsService.create(dto, user.patientProfile.id);
  }

  @Get()
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  findAll(@Query('blogPostId') blogPostId?: string) {
    return this.commentsService.findAll(blogPostId);
  }

  @Patch(':id')
  @Roles('PATIENT', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.commentsService.update(id, dto, userId, role);
  }

  @Delete(':id')
  @Roles('PATIENT', 'ADMIN')
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.commentsService.remove(id, userId, role);
  }

  // Admin moderation endpoint
  @Patch(':id/moderate')
  @Roles('ADMIN')
  moderate(@Param('id') id: string, @Body('approve') approve: boolean) {
    return this.commentsService.moderate(id, approve);
  }
}
