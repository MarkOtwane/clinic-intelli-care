import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const ALLOWED_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export const MAX_MEDIA_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export class UploadMediaDto {
  @IsString()
  type: string; // e.g., 'PROFILE_IMAGE', 'MEDICAL_REPORT', 'BLOG_IMAGE'

  @IsIn(ALLOWED_MEDIA_MIME_TYPES, {
    message:
      'Invalid file type. Allowed types: image/jpeg, image/png, image/webp, application/pdf',
  })
  mimetype: (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(MAX_MEDIA_FILE_SIZE_BYTES, {
    message: 'File size must not exceed 5MB',
  })
  size: number;

  @IsOptional()
  uploadedById?: string;
}
