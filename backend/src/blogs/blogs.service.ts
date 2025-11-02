import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBlogDto, authorId: string) {
    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        content: dto.content,
        imageUrl: dto.imageUrl,
        authorId,
      },
      include: { author: true },
    });
  }

  async findAll() {
    return this.prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: { author: true, comments: { include: { author: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async update(id: string, dto: UpdateBlogDto) {
    return this.prisma.blogPost.update({
      where: { id },
      data: dto,
      include: { author: true },
    });
  }

  async remove(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  async findByDoctor(doctorId: string) {
    return this.prisma.blogPost.findMany({
      where: { authorId: doctorId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
