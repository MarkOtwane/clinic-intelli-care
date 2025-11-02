import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

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

    const result: UploadApiResponse = await cloudinary.uploader.upload_stream({
      resource_type: 'auto',
      folder: 'hms_uploads',
    });

    const media = await this.prisma.media.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        type: file.mimetype.split('/')[0],
        ownerId,
        ownerType,
      },
    });

    return media;
  }

  async deleteMedia(publicId: string) {
    await cloudinary.uploader.destroy(publicId);
    return this.prisma.media.delete({ where: { publicId } });
  }

  async getMediaByOwner(ownerId: string) {
    return this.prisma.media.findMany({ where: { ownerId } });
  }
}
