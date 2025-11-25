import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    ownerId?: string,
    ownerType?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'hms_uploads',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        },
      );
      uploadStream.end(file.buffer);
    });

    const media = await this.prisma.media.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        mimeType: file.mimetype,
        uploadedById: ownerId,
      },
    });

    return media;
  }

  async deleteMedia(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
    const media = await this.prisma.media.findFirst({
      where: { publicId },
    });
    if (!media) {
      throw new BadRequestException('Media not found');
    }
    return this.prisma.media.delete({ where: { id: media.id } });
  }

  async getMediaByOwner(ownerId: string) {
    return this.prisma.media.findMany({ where: { uploadedById: ownerId } });
  }
}
