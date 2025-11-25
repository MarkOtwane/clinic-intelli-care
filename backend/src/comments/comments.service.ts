import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, patientId: string) {
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        blogPostId: dto.blogPostId,
        authorId: patientId,
      },
      include: { author: true },
    });
  }

  async findAll(blogPostId?: string) {
    return this.prisma.comment.findMany({
      where: {
        ...(blogPostId ? { blogPostId } : {}),
        isApproved: true,
      },
      include: { author: true, blogPost: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    dto: UpdateCommentDto,
    currentUserId: string,
    role: string,
  ) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (role !== 'ADMIN' && comment.authorId !== currentUserId) {
      throw new ForbiddenException('You can only edit your own comment');
    }

    return this.prisma.comment.update({
      where: { id },
      data: dto,
      include: { author: true },
    });
  }

  async remove(id: string, currentUserId: string, role: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (role !== 'ADMIN' && comment.authorId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    return this.prisma.comment.delete({ where: { id } });
  }

  async moderate(id: string, approve: boolean) {
    return this.prisma.comment.update({
      where: { id },
      data: { isApproved: approve },
    });
  }
}
