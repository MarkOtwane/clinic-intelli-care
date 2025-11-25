import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate URL-friendly slug from title
   * @param title - Blog post title
   * @returns URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Create a unique slug by appending timestamp if needed
   * @param baseSlug - Base slug from title
   * @param excludeId - Optional ID to exclude when checking uniqueness
   * @returns Unique slug
   */
  private async generateUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(dto: CreateBlogDto, authorId: string) {
    // Generate unique slug from title
    const baseSlug = this.generateSlug(dto.title);
    const slug = await this.generateUniqueSlug(baseSlug);

    // Link images if provided
    const imagesData =
      dto.imageIds && dto.imageIds.length > 0
        ? {
            connect: dto.imageIds.map((imageId: string) => ({ id: imageId })),
          }
        : undefined;

    return await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        authorId,
        published: dto.published ?? false, // Default to unpublished
        ...(imagesData && { images: imagesData }),
      },
      include: { author: true, images: true },
    });
  }

  async findAll() {
    return await this.prisma.blogPost.findMany({
      where: { published: true },
      include: { author: true, comments: true, images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Like or unlike a blog post
   * @param id - Blog post ID
   * @param increment - True to increment likes, false to decrement
   * @returns Updated blog post
   */
  async toggleLike(id: string, increment: boolean = true) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      select: { likes: true },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    const newLikes = increment ? post.likes + 1 : Math.max(0, post.likes - 1);

    return await this.prisma.blogPost.update({
      where: { id },
      data: { likes: newLikes },
      include: { author: true, comments: true, images: true },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: true,
        comments: { include: { author: true } },
        images: true,
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async update(id: string, dto: UpdateBlogDto) {
    return await this.prisma.blogPost.update({
      where: { id },
      data: dto,
      include: { author: true, images: true },
    });
  }

  async remove(id: string) {
    return await this.prisma.blogPost.delete({ where: { id } });
  }

  async findByDoctor(doctorId: string) {
    return await this.prisma.blogPost.findMany({
      where: { authorId: doctorId },
      include: { images: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
