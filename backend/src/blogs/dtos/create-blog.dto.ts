import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[]; // Array of Media IDs to link to blog post

  @IsOptional()
  @IsBoolean()
  published?: boolean; // Defaults to false (unpublished)
}
