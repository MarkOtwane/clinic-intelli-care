import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles('PATIENT')
  create(@Body() dto: CreateCommentDto, @CurrentUser('id') patientId: string) {
    return this.commentsService.create(dto, patientId);
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
