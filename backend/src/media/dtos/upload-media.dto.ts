import { IsString, IsOptional } from 'class-validator';

export class UploadMediaDto {
  @IsString()
  type: string; // e.g., 'PROFILE_IMAGE', 'MEDICAL_REPORT', 'BLOG_IMAGE'

  @IsOptional()
  uploadedById?: string;
}
